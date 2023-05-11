-- CreateTable
CREATE TABLE `partner` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ceo_name` VARCHAR(10) NOT NULL,
    `ceo_phone_number` VARCHAR(30) NOT NULL,
    `company_registration_number` VARCHAR(191) NOT NULL,
    `representative_number` VARCHAR(30) NOT NULL,
    `partner_nick_name` VARCHAR(100) NOT NULL,
    `partner_name` VARCHAR(100) NOT NULL,
    `memo` VARCHAR(500) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `company_id` INTEGER NOT NULL,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounted` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accounted_type` ENUM('PAID', 'COLLECTED') NOT NULL,
    `accounted_method` ENUM('ACCOUNT_TRANSFER', 'PROMISSORY_NOTE', 'CARD_PAYMENT', 'CASH', 'SET_OFF', 'ETC', 'All') NOT NULL,
    `accounted_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `accounted_subject` ENUM('PAID_ACCOUNTS_RECEIVABLE', 'PAID_UNPAID_AMOUNTS', 'PAID_ADVANCES', 'PAID_MISCELLANEOUS_INCOME', 'PAID_PRODUCT_SALES', 'COLLECTED_ACCOUNTS_RECEIVABLE', 'COLLECTED_UNPAID_EXPENSES', 'COLLECTED_PREPAID_EXPENSES', 'COLLECTED_MISCELLANEOUS_LOSSES', 'COLLECTED_PRODUCT_PURCHASES', 'ETC', 'All') NOT NULL,
    `memo` VARCHAR(500) NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `partner_id` INTEGER NOT NULL,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `by_cash` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cash_amount` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `accounted_id` INTEGER NOT NULL,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `by_cash_accounted_id_key`(`accounted_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `by_etc` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `etc_amount` INTEGER NOT NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `accounted_id` INTEGER NOT NULL,
    `reg_id` VARCHAR(255) NULL,
    `reg_nm` VARCHAR(255) NULL,
    `chg_id` VARCHAR(255) NULL,
    `chg_nm` VARCHAR(255) NULL,
    `chg_dt` DATETIME(3) NOT NULL,
    `reg_dt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `by_etc_accounted_id_key`(`accounted_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `partner` ADD CONSTRAINT `partner_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `Company`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `accounted` ADD CONSTRAINT `accounted_partner_id_fkey` FOREIGN KEY (`partner_id`) REFERENCES `partner`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `by_cash` ADD CONSTRAINT `by_cash_accounted_id_fkey` FOREIGN KEY (`accounted_id`) REFERENCES `accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `by_etc` ADD CONSTRAINT `by_etc_accounted_id_fkey` FOREIGN KEY (`accounted_id`) REFERENCES `accounted`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
