import {
  ForbiddenException,
  Get,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/core';
import {
  checkCertValidation,
  getCertUrl,
  getTaxInvoiceInfos,
} from './popbill.service';
import { CERT_NOT_FOUND_ERROR, SUCCESS } from '../code/popbill.code';

@Injectable()
export class PopbillRetriveService {
  constructor(private readonly prisma: PrismaService) {}

  async getCertUrl(companyId: number): Promise<string> {
    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });
    if (!company.popbillId)
      throw new InternalServerErrorException(`팝빌 아이디 등록 필요`);

    return await getCertUrl(
      company.companyRegistrationNumber,
      company.popbillId,
    );
  }

  async checkCertValidation(CorpNum: string): Promise<number> {
    const result = await checkCertValidation(CorpNum);
    switch (result) {
      // 인증서 유효함
      case SUCCESS:
      // 인증서 재등록 필요
      case CERT_NOT_FOUND_ERROR:
        return result;
      // 알 수 없는 에러
      default:
        throw new InternalServerErrorException();
    }
  }

  async getTaxInvoiceInfos(CorpNum: string, mgtKeyList: string[]) {
    return await getTaxInvoiceInfos(CorpNum, mgtKeyList);
  }
}
