import { Prisma, PrismaClient } from '@prisma/client';
import * as Data from './data';

const prisma = new PrismaClient();

async function main() {
  await prisma.company.createMany({
    data: [
      {
        businessName: 'Apple',
        companyRegistrationNumber: '123456789',
        email: 'apple@test.paperware.kr',
        phoneNo: '010-1234-5678',
        faxNo: '02-1234-5678',
      },
      {
        businessName: 'Google',
        companyRegistrationNumber: '987654321',
        email: 'google@test.paperware.kr',
        phoneNo: '010-1234-5678',
        faxNo: '02-1234-5678',
      },
      {
        businessName: 'Microsoft',
        companyRegistrationNumber: '123456788',
        email: 'microsoft@test.paperware.kr',
        phoneNo: '010-1234-5678',
        faxNo: '02-1234-5678',
      },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        username: 'apple',
        password: '0000',
        email: 'steve.apple@test.paperware.kr',
        name: 'Steve Jobs',
        companyId: 1,
      },
      {
        username: 'google',
        password: '0000',
        email: 'sundar.google@test.paperware.kr',
        name: 'Sundar Pichai',
        companyId: 2,
      },
      {
        username: 'microsoft',
        password: '0000',
        email: 'bill.microsoft@test.paperware.kr',
        name: 'Bill Gates',
        companyId: 3,
      },
    ],
  });

  await prisma.paperDomain.createMany({
    data: Data.PAPER_DOMAIN.map((name) => ({ name })),
  });
  await prisma.manufacturer.createMany({
    data: Data.MANUFACTURER.map((name) => ({ name })),
  });
  await prisma.paperGroup.createMany({
    data: Data.PAPER_GROUP.map((name) => ({ name })),
  });
  await prisma.paperType.createMany({
    data: Data.PAPER_TYPE.map((name) => ({ name })),
  });
  await prisma.product.createMany({
    data: [
      {
        paperDomainId: 1,
        manufacturerId: 1,
        paperGroupId: 1,
        paperTypeId: 1,
      },
      {
        paperDomainId: 1,
        manufacturerId: 1,
        paperGroupId: 1,
        paperTypeId: 2,
      },
      {
        paperDomainId: 2,
        manufacturerId: 3,
        paperGroupId: 1,
        paperTypeId: 3,
      },
    ],
  });
  await prisma.paperColorGroup.createMany({
    data: Data.PAPER_COLOR_GROUP.map((name) => ({ name })),
  });
  await prisma.paperColor.createMany({
    data: Data.PAPER_COLOR.map((name) => ({ name })),
  });
  await prisma.paperCert.createMany({
    data: Data.PAPER_CERT.map((name) => ({ name })),
  });
  await prisma.packaging.createMany({
    data: [
      {
        name: 'SKID',
        type: 'SKID',
        packA: 0,
        packB: 0,
      },
      ...Data.DIEMETER.map<Prisma.PackagingCreateInput>(([packA, packB]) => ({
        name: `ROLL ${packA} ${packB === 0 ? 'inch' : 'mm'}`,
        type: 'ROLL',
        packA,
        packB,
      })),
      ...Data.PER_PACKAGE.map<Prisma.PackagingCreateInput>(
        ([packA, packB]) => ({
          name: `BOX ${packA}×${packB}`,
          type: 'BOX',
          packA,
          packB,
        }),
      ),
      ...Data.PER_REAM.map<Prisma.PackagingCreateInput>(([packA, packB]) => ({
        name: `REAM ${packA}`,
        type: 'REAM',
        packA,
        packB,
      })),
    ],
  });
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
