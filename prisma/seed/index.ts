import { Prisma, PrismaClient } from '@prisma/client';
// import * as Data from './data';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(
    fs.readFileSync(__dirname + '/metadata.json', 'utf8'),
  );

  // 미사용기업 송장
  await prisma.tempInvoiceCode.create({
    data: {
      invoiceCode: 'PWR',
      number: 1,
      maxPercent: 50,
    },
  });

  // 메타데이터
  await prisma.packaging.createMany({
    data: data.packagings.map((item) => item),
  });
  await prisma.paperDomain.createMany({
    data: data.paperDomains.map((item) => item),
  });
  await prisma.paperGroup.createMany({
    data: data.paperGroups.map((item) => item),
  });
  await prisma.paperType.createMany({
    data: data.paperTypes.map((item) => item),
  });
  await prisma.manufacturer.createMany({
    data: data.manufacturers.map((item) => item),
  });
  await prisma.product.createMany({
    data: data.products.map((item) => item),
  });
  await prisma.paperColorGroup.createMany({
    data: data.paperColorGroups.map((item) => item),
  });
  await prisma.paperColor.createMany({
    data: data.paperColors.map((item) => item),
  });
  await prisma.paperPattern.createMany({
    data: data.paperPatterns.map((item) => item),
  });
  await prisma.paperCert.createMany({
    data: data.paperCerts.map((item) => item),
  });

  // 회사
  await prisma.company.createMany({
    data: data.companies.map((c) => ({
      id: c.id,
      businessName: c.name,
      companyRegistrationNumber: c.regiNo,
      address: `[[12345]] [[${c.addr}::]] [[]] [[${c.addr2}]]`,
      phoneNo: c.phoneNo,
      faxNo: c.faxNo,
      representative: c.rep,
      invoiceCode: c.invoice,
      bizType: c.bizType,
      bizItem: c.bizItem,
      popbillId: c.popbillId,
    })),
  });
  await prisma.company.createMany({
    data: data.notUsingPartners.map((c) => ({
      id: c.id,
      businessName: c.name,
      companyRegistrationNumber: c.regiNo,
      address: `[[12345]] [[${c.addr}::]] [[]] [[${c.addr2}]]`,
      phoneNo: c.phoneNo,
      faxNo: c.faxNo,
      representative: c.rep,
      invoiceCode: '',
      bizType: '',
      bizItem: '',
      managedById: c.managedBy,
      isActivated: false,
    })),
  });
  await prisma.businessRelationship.createMany({
    data: data.businessRelationShips.map((br) => br),
  });
  await prisma.partner.createMany({
    data: data.partners.map((item) => item),
  });

  // 유저
  await prisma.user.createMany({
    data: data.users.map((u) => ({
      id: u.id,
      username: u.userId,
      password: u.password,
      name: u.name,
      email: u.email,
      companyId: u.companyId,
      phoneNo: u.phoneNo,
      birthDate: '1900-01-01T09:00:00.000Z',
      isAdmin: u.isAdmin,
      lastLoginTime: new Date(),
    })),
  });

  // 창고 & 도착지
  await prisma.warehouse.createMany({
    data: data.warehouses.map((w) => ({
      id: w.id,
      name: w.name,
      companyId: w.companyId,
      address: `[[12345]] [[${w.addr}::]] [[::]] [[]]`,
      isPublic: w.public,
    })),
  });
  await prisma.location.createMany({
    data: data.locations.map((w) => ({
      id: w.id,
      name: w.name,
      companyId: w.companyId,
      address: `[[12345]] [[${w.addr}::]] [[::]] [[]]`,
      isPublic: w.public,
    })),
  });

  // 고시가
  await prisma.officialPriceCondition.createMany({
    data: data.officialPrices.map((item) => ({
      id: item.id,
      productId: item.productId,
      grammage: item.grammage,
      sizeX: item.sizeX,
      sizeY: item.sizeY,
      paperColorGroupId: item.paperColorGroupId || undefined,
      paperColorId: item.paperColorId || undefined,
      paperPatternId: item.paperPatternId || undefined,
      paperCertId: item.paperCertId || undefined,
    })),
  });

  for (const company of data.companies) {
    await prisma.officialPriceMap.createMany({
      data: data.officialPriceWholesAndRetails.map((item) => ({
        companyId: company.id,
        ...item,
      })),
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
