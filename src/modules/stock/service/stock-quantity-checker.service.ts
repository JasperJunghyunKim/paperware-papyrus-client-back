// import { Injectable } from "@nestjs/common";
// import { PrismaTransaction } from "src/common/types";
// import { StockError } from "../infrastructure/constants/stock-error.enum";
// import { InsufficientStockQuantityException } from "../infrastructure/exception/insufficient-stock-quantity.exception";
// import { StockGroupNotFoundException } from "../infrastructure/exception/stock-group-notfound.exception";

// interface StockGroup {
//     warehouseId: number;
//     productId: number;
//     packagingId: number;
//     grammage: number;
//     sizeX: number;
//     sizeY: number;
//     paperColorGroupId: number;
//     paperColorId: number;
//     paperPatternId: number;
//     paperCertId: number;
// }

// @Injectable()
// export class StockQuantityCheckerService {

//     /** 자사 재고그룹 가용재고 수량 확인 */
//     async checkInhouseStockGroupAvaliableQuantityTx(
//         tx: PrismaTransaction,
//         companyId: number,
//         stockGroup: StockGroup,
//         quantity: number,
//     ) {
//         const stockGroups = await tx.stock.groupBy({
//             by: [
//                 'warehouseId',
//                 'productId',
//                 'packagingId',
//                 'grammage',
//                 'sizeX',
//                 'sizeY',
//                 'paperColorGroupId',
//                 'paperColorId',
//                 'paperPatternId',
//                 'paperCertId',
//             ],
//             _sum: {
//                 cachedQuantityAvailable: true,
//             },
//             where: {
//                 warehouseId: stockGroup.warehouseId,
//                 productId: stockGroup.productId,
//                 packagingId: stockGroup.packagingId,
//                 grammage: stockGroup.grammage,
//                 sizeX: stockGroup.sizeX,
//                 sizeY: stockGroup.sizeY,
//                 paperColorGroupId: stockGroup.paperColorGroupId,
//                 paperColorId: stockGroup.paperColorId,
//                 paperPatternId: stockGroup.paperPatternId,
//                 paperCertId: stockGroup.paperCertId,
//                 companyId,
//             }
//         });
//         if (stockGroups.length === 0) throw new StockGroupNotFoundException(StockError.STOCK002);
//         const selectedStockGroup = stockGroups[0]

//         const inputStockGroup = await tx.stockGroupEvent.groupBy({
//             by: ['stockGroupId'],
//             _sum: {
//                 change: true,
//             },
//             where: {
//                 stockGroup: {
//                     warehouseId: stockGroup.warehouseId,
//                     productId: stockGroup.productId,
//                     packagingId: stockGroup.packagingId,
//                     grammage: stockGroup.grammage,
//                     sizeX: stockGroup.sizeX,
//                     sizeY: stockGroup.sizeY,
//                     paperColorGroupId: stockGroup.paperColorGroupId,
//                     paperColorId: stockGroup.paperColorId,
//                     paperPatternId: stockGroup.paperPatternId,
//                     paperCertId: stockGroup.paperCertId,
//                     companyId: companyId,
//                 }
//             }
//         });
//         const availableQuantity =
//             selectedStockGroup._sum.cachedQuantityAvailable + (inputStockGroup.length === 0 ? 0 : inputStockGroup[0]._sum.change);

//         if (quantity > availableQuantity) {
//             console.log(`재고수량부족 (사용예정: ${quantity}, 가용수량: ${availableQuantity})`);
//             throw new InsufficientStockQuantityException(StockError.STOCK003, [quantity, availableQuantity])
//         }

//         return selectedStockGroup;
//     }
// }
