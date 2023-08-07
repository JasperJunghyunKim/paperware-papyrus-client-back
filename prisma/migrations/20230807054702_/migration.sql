/*
  Warnings:

  - You are about to drop the column `bankComapny` on the `BankAccount` table. All the data in the column will be lost.
  - Added the required column `bank` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BankAccount` DROP COLUMN `bankComapny`,
    ADD COLUMN `bank` ENUM('KAKAO_BANK', 'KOOKMIN_BANK', 'KEB_HANA_BANK', 'NH_BANK', 'SHINHAN_BANK', 'IBK', 'WOORI_BANK', 'CITI_BANK_KOREA', 'HANA_BANK', 'SC_FIRST_BANK', 'KYONGNAM_BANK', 'KWANGJU_BANK', 'DAEGU_BANK', 'DEUTSCHE_BANK', 'BANK_OF_AMERICA', 'BUSAN_BANK', 'NACF', 'SAVINGS_BANK', 'NACCSF', 'SUHYUP_BANK', 'NACUFOK', 'POST_OFFICE', 'JEONBUK_BANK', 'JEJU_BANK', 'K_BANK', 'TOS_BANK') NOT NULL;
