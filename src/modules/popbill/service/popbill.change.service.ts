import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import {
  OrderType,
  PackagingType,
  TaxInvoicePurposeType,
  TaxInvoiceStatus,
} from '@prisma/client';
import { TON_TO_GRAM } from 'src/common/const';
import { PrismaService } from 'src/core';
import { PopbillRetriveService } from './popbill.retrive.service';
import { SUCCESS } from '../code/popbill.code';
import { createPopbillTaxInvoice } from './popbill.service';

interface TaxInvoiceForIssue {
  id: number;
  invoicerMgtKey: string;
  writeDate: string;
  purposeType: TaxInvoicePurposeType;
  dstCompanyRegistrationNumber: string;
  dstCompanyName: string;
  dstCompanyRepresentative: string;
  dstCompanyAddress: string;
  dstCompanyBizType: string;
  dstCompanyBizItme: string;
  dstEmail: string;
  srcCompanyRegistrationNumber: string;
  srcCompanyName: string;
  srcCompanyRepresentative: string;
  srcCompanyAddress: string;
  srcCompanyBizType: string;
  srcCompanyBizItem: string;
  srcEmail: string;
  srcEmail2: string;
  status: TaxInvoiceStatus;
  cash: number | null;
  check: number | null;
  note: number | null;
  credit: number | null;
  orderCount: BigInt;
}

interface TaxInoviceOrderForIssue {
  id: number;
  orderNo: string;
  orderType: OrderType;
  dstDepositEventId: number | null;
  packagingType: PackagingType | null;
  paperDomainName: string | null;
  paperGroupName: string | null;
  paperTypeName: string | null;
  manufacturerName: string | null;
  grammage: number | null;
  sizeX: number | null;
  sizeY: number | null;
  quantity: number | null;
  item: string | null;
  suppliedPrice: number;
  vatPrice: number;
}

@Injectable()
export class PopbillChangeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly popbillRetriveService: PopbillRetriveService,
  ) {}

  async issueTaxInvoice(companyId: number, taxInvoiceId: number) {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    const check = await this.popbillRetriveService.checkCertValidation(
      company.companyRegistrationNumber,
    );
    if (check !== SUCCESS) {
      const certUrl = await this.popbillRetriveService.getCertUrl(companyId);
      return {
        certUrl,
      };
    }

    await this.prisma.$transaction(async (tx) => {
      const [taxInvoice]: TaxInvoiceForIssue[] = await tx.$queryRaw`
        SELECT ti.id
              , ti.invoicerMgtKey AS invoicerMgtKey
              , ti.dstCompanyRegistrationNumber AS dstCompanyRegistrationNumber
              , ti.dstCompanyName AS dstCompanyName
              , ti.dstCompanyRepresentative AS dstCompanyRepresentative
              , ti.dstCompanyAddress AS dstCompanyAddress
              , ti.dstCompanyBizType AS dstCompanyBizType
              , ti.dstCompanyBizItme AS dstCompanyBizItme
              , ti.dstEmail AS dstEmail
              , ti.srcCompanyRegistrationNumber AS srcCompanyRegistrationNumber
              , ti.srcCompanyName AS srcCompanyName
              , ti.srcCompanyRepresentative AS srcCompanyRepresentative
              , ti.srcCompanyAddress AS srcCompanyAddress
              , ti.srcCompanyBizType AS srcCompanyBizType
              , ti.srcCompanyBizItem AS srcCompanyBizItem
              , ti.srcEmail AS srcEmail
              , ti.srcEmail2 AS srcEmail2
              , ti.status
              , ti.cash AS cash
              , ti.check AS check
              , ti.note AS note
              , ti.credit AS credit
              , COUNT(CASE WHEN o.id IS NOT NULL THEN 1 END) AS orderCount
          FROM TaxInvoice  AS ti
     LEFT JOIN \`Order\`   AS o   ON o.taxInvoiceId = ti.id
         WHERE ti.id = ${taxInvoiceId}
           AND ti.companyId = ${companyId}

        GROUP BY ti.id

        FOR UPDATE
      `;

      if (!taxInvoice)
        throw new NotFoundException(`존재하지 않는 세금계산서 입니다.`);
      if (taxInvoice.status !== 'PREPARING')
        throw new ConflictException(`발행을 할 수 없는 상태입니다.`);
      if (Number(taxInvoice.orderCount) === 0)
        throw new ConflictException(`매출이 등록되지 않은 세금계산서 입니다.`);

      const orders: TaxInoviceOrderForIssue[] = await tx.$queryRaw`
        SELECT o.id
              , o.orderNo
              , o.orderType
              , o.dstDepositEventId AS dstDepositEventId
              , packaging.type AS packagingType
              , paperDomain.name AS paperDomainName
              , paperGroup.name AS paperGroupName
              , paperType.name AS paperTypeName
              , manufacturer.name AS manufacturerName
              -- 주문원지
              , (CASE
                WHEN o.orderType = ${OrderType.NORMAL} THEN os.grammage
                WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.grammage
                WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.grammage
                ELSE NULL
              END) AS grammage
              , (CASE
                WHEN o.orderType = ${OrderType.NORMAL} THEN os.sizeX
                WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.sizeX
                WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.sizeX
                ELSE NULL
              END) AS sizeX
              , (CASE
                WHEN o.orderType = ${OrderType.NORMAL} THEN os.sizeY
                WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.sizeY
                WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.sizeY
                ELSE NULL
              END) AS sizeY
              , (CASE
                WHEN o.orderType = ${OrderType.NORMAL} THEN os.quantity
                WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.quantity
                WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.quantity
                ELSE NULL
              END) AS quantity
              -- 기타매출 
              , oe.item AS item

              , IFNULL(tp.suppliedPrice, 0) AS suppliedPrice
              , IFNULL(tp.vatPrice, 0) AS vatPrice
          
          FROM \`Order\`      AS o
     LEFT JOIN OrderStock     AS os    ON os.orderId = o.id
     LEFT JOIN OrderProcess   AS op    ON op.orderId = o.id
     LEFT JOIN OrderDeposit   AS od    ON od.orderId = o.id
     LEFT JOIN OrderEtc       AS oe    ON oe.orderId = o.id
     LEFT JOIN TradePrice     AS tp    ON tp.orderId = o.id AND tp.companyId = o.dstCompanyId

     LEFT JOIN Packaging      AS packaging ON packaging.id = (CASE 
                                                        WHEN o.orderType = ${OrderType.NORMAL} THEN os.packagingId
                                                        WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.packagingId
                                                        WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.packagingId
                                                        ELSE 0
                                                      END)
     LEFT JOIN Product        AS product ON product.id = (CASE 
                                                        WHEN o.orderType = ${OrderType.NORMAL} THEN os.productId
                                                        WHEN o.orderType = ${OrderType.DEPOSIT} THEN od.productId
                                                        WHEN o.orderType = ${OrderType.OUTSOURCE_PROCESS} THEN op.productId
                                                        ELSE 0
                                                      END)
     LEFT JOIN PaperDomain    AS paperDomain    ON paperDomain.id = product.paperDomainId
     LEFT JOIN PaperGroup     AS paperGroup     ON paperGroup.id = product.paperGroupId
     LEFT JOIN PaperType      AS paperType      ON paperType.id = product.paperTypeId
     LEFT JOIN Manufacturer   AS manufacturer   ON manufacturer.id = product.manufacturerId

         WHERE taxInvoiceId = ${taxInvoiceId}
           FOR UPDATE
      `;
      console.log(orders);

      const PopbillTaxInvoice = createPopbillTaxInvoice({
        ...taxInvoice,
        orders: [],
      });

      return {
        certUrl: null,
      };
    });
  }
}
