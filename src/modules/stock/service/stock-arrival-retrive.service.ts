// import { Injectable } from '@nestjs/common';
// import { Model } from 'src/@shared';
// import { Selector, Util } from 'src/common';
// import { PrismaService } from 'src/core';

// @Injectable()
// export class StockArrivalRetriveService {
//   constructor(private readonly prisma: PrismaService) { }

//   async getStockArrivalList(params: {
//     skip?: number;
//     take?: number;
//     companyId: number;
//   }): Promise<Model.ArrivalStockGroup[]> {
//     const { skip, take, companyId } = params;

//     const items = await this.prisma.stockGroup.findMany({
//       include: {
//         stockGroupEvent: true,
//         orderStock: {
//           include: {
//             order: {
//               include: {
//                 srcCompany: true,
//                 dstCompany: true,
//               }
//             },
//             product: {
//               include: {
//                 paperDomain: true,
//                 manufacturer: true,
//                 paperGroup: true,
//                 paperType: true,
//               }
//             },
//             packaging: true,
//             paperColorGroup: true,
//             paperColor: true,
//             paperPattern: true,
//             paperCert: true,
//             dstLocation: {
//               include: {
//                 company: true,
//               }
//             },
//             warehouse: {
//               include: {
//                 company: true,
//               }
//             },
//             plan: true,
//           }
//         },
//         product: {
//           include: {
//             paperDomain: true,
//             manufacturer: true,
//             paperGroup: true,
//             paperType: true,
//           }
//         },
//         packaging: true,
//         paperColorGroup: true,
//         paperColor: true,
//         paperPattern: true,
//         paperCert: true,
//       },
//       where: {
//         companyId,
//         isArrived: false,
//         stockGroupEvent: {
//           some: {
//             status: {
//               not: 'CANCELLED',
//             }
//           }
//         }
//       }
//     });

//     return items.map(item => {
//       const totalQuantity = item.stockGroupEvent.reduce((prev, cur) => {
//         return prev + cur.change;
//       }, 0);
//       const storingQuantity = item.stockGroupEvent.filter(item => item.change > 0)
//         .reduce((prev, cur) => {
//           return prev + cur.change;
//         }, 0);

//       const orderCompany = (item.orderStock?.order.srcCompany.id === companyId ?
//         item.orderStock?.order.dstCompany :
//         item.orderStock?.order.srcCompany) || null;

//       return {
//         id: item.id,
//         company: null, // 도착예정재고 => 자신의 회사이므로 정보 필요X
//         product: item.product,
//         packaging: item.packaging,
//         grammage: item.grammage,
//         sizeX: item.sizeX,
//         sizeY: item.sizeY,
//         paperColorGroup: item.paperColorGroup,
//         paperColor: item.paperColor,
//         paperPattern: item.paperPattern,
//         paperCert: item.paperCert,
//         warehouse: null, // 도착예정재고 => 창고 null
//         orderCompanyInfo: orderCompany,
//         orderInfo: item.orderStock?.order ? {
//           wantedDate: item.orderStock.order.wantedDate.toISOString(),
//         } : null,
//         orderStock: item.orderStock ? {
//           id: item.orderStock.id,
//           orderId: item.orderStock.orderId,
//           dstLocation: item.orderStock.dstLocation,
//           warehouse: item.orderStock.warehouse,
//           product: item.orderStock.product,
//           packaging: item.orderStock.packaging,
//           grammage: item.orderStock.grammage,
//           sizeX: item.orderStock.sizeX,
//           sizeY: item.orderStock.sizeY,
//           paperColorGroup: item.orderStock.paperColorGroup,
//           paperColor: item.orderStock.paperColor,
//           paperPattern: item.orderStock.paperPattern,
//           paperCert: item.orderStock.paperCert,
//           quantity: item.orderStock.quantity,
//           plan: item.orderStock.plan ? {
//             id: item.orderStock.planId,
//             planNo: item.orderStock.plan.planNo,
//           } : null,
//         } : null,
//         totalQuantity,
//         storingQuantity,
//         nonStoringQuantity: totalQuantity - storingQuantity,
//       }
//     });
//   }

//   async getStockArrivalCount(params: { companyId: number }) {
//     return await this.prisma.stockGroupEvent.count({
//       where: {
//         status: 'PENDING',
//         stockGroup: {
//           companyId: params.companyId,
//         },
//         change: {
//           gt: 0,
//         },
//       },
//     });
//   }
// }
