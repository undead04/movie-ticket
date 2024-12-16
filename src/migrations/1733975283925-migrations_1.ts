import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations11733975283925 implements MigrationInterface {
    name = 'Migrations11733975283925'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_240853a0c3353c25fb12434ad3\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_role_permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`group_role_id\` int NULL, \`permission_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_280f82055c16b81ab2f90983f4\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`payment\` (\`id\` int NOT NULL AUTO_INCREMENT, \`paymentMethod\` enum ('credit_card', 'paypal', 'bank_transfer', 'cash') NOT NULL, \`amount\` decimal(10,2) NOT NULL, \`paymentStatus\` enum ('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending', \`paymentTime\` datetime NOT NULL, \`billId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bill\` (\`id\` int NOT NULL AUTO_INCREMENT, \`totalPrice\` decimal(10,2) NOT NULL, \`bookingTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`email\` varchar(100) NOT NULL, \`phone\` varchar(15) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`review\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int(1) NOT NULL, \`comment\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`movieId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_dd8cd9e50dd049656e4be1f7e8\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie_genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`genreId\` int NULL, \`movieId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`genre\` varchar(255) NULL, \`duration\` int NOT NULL, \`trailerUrl\` varchar(255) NULL, \`posterUrl\` varchar(255) NULL, \`releaseDate\` date NULL, \`endDate\` date NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`theater\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`address\` text NOT NULL, \`city\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seat\` (\`id\` int NOT NULL AUTO_INCREMENT, \`seatNumber\` varchar(255) NOT NULL, \`row\` int NOT NULL, \`col\` int NOT NULL, \`screenId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`screen\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`seatCapacity\` int NOT NULL, \`theaterId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`showtime\` (\`id\` int NOT NULL AUTO_INCREMENT, \`showDate\` date NOT NULL, \`startTime\` time NOT NULL, \`endTime\` time NOT NULL, \`price\` decimal(10,2) NOT NULL, \`movieId\` int NULL, \`screenId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`showtimeId\` int NULL, \`seatId\` int NULL, \`billId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` ADD CONSTRAINT \`FK_0d77c4f45bd75ace23e89bc2004\` FOREIGN KEY (\`group_role_id\`) REFERENCES \`group_role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` ADD CONSTRAINT \`FK_810f69863ba9687d164a0f9ea12\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permission\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`payment\` ADD CONSTRAINT \`FK_f8e64c2303f86d781d06bbd549c\` FOREIGN KEY (\`billId\`) REFERENCES \`bill\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bill\` ADD CONSTRAINT \`FK_275fe11db713fd6f9fd62709917\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_cace4a159ff9f2512dd42373760\` FOREIGN KEY (\`id\`) REFERENCES \`group_role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1337f93918c70837d3cea105d39\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_4ccf71f9d14aa1a059877b06343\` FOREIGN KEY (\`movieId\`) REFERENCES \`movie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` ADD CONSTRAINT \`FK_f641f620b3fe496553aa442b026\` FOREIGN KEY (\`genreId\`) REFERENCES \`genre\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` ADD CONSTRAINT \`FK_89ab58f5defce509fa9acffa723\` FOREIGN KEY (\`movieId\`) REFERENCES \`movie\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`seat\` ADD CONSTRAINT \`FK_1140d3d30847c3a13faa0a43329\` FOREIGN KEY (\`screenId\`) REFERENCES \`screen\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`screen\` ADD CONSTRAINT \`FK_251c9d2385c1ddcc67bb2e718e6\` FOREIGN KEY (\`theaterId\`) REFERENCES \`theater\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`showtime\` ADD CONSTRAINT \`FK_1af27f8171269552599f8e18ff1\` FOREIGN KEY (\`movieId\`) REFERENCES \`movie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`showtime\` ADD CONSTRAINT \`FK_c723afd3a25e576a86d90c16d6f\` FOREIGN KEY (\`screenId\`) REFERENCES \`screen\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_2c35aa6c90c4dd7450dad753ae5\` FOREIGN KEY (\`showtimeId\`) REFERENCES \`showtime\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_ab9b02f72bbc7d05bd15a5cb6b4\` FOREIGN KEY (\`seatId\`) REFERENCES \`seat\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`ticket\` ADD CONSTRAINT \`FK_4931e2f03f0800846072cda2daf\` FOREIGN KEY (\`billId\`) REFERENCES \`bill\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_4931e2f03f0800846072cda2daf\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_ab9b02f72bbc7d05bd15a5cb6b4\``);
        await queryRunner.query(`ALTER TABLE \`ticket\` DROP FOREIGN KEY \`FK_2c35aa6c90c4dd7450dad753ae5\``);
        await queryRunner.query(`ALTER TABLE \`showtime\` DROP FOREIGN KEY \`FK_c723afd3a25e576a86d90c16d6f\``);
        await queryRunner.query(`ALTER TABLE \`showtime\` DROP FOREIGN KEY \`FK_1af27f8171269552599f8e18ff1\``);
        await queryRunner.query(`ALTER TABLE \`screen\` DROP FOREIGN KEY \`FK_251c9d2385c1ddcc67bb2e718e6\``);
        await queryRunner.query(`ALTER TABLE \`seat\` DROP FOREIGN KEY \`FK_1140d3d30847c3a13faa0a43329\``);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` DROP FOREIGN KEY \`FK_89ab58f5defce509fa9acffa723\``);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` DROP FOREIGN KEY \`FK_f641f620b3fe496553aa442b026\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_4ccf71f9d14aa1a059877b06343\``);
        await queryRunner.query(`ALTER TABLE \`review\` DROP FOREIGN KEY \`FK_1337f93918c70837d3cea105d39\``);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_cace4a159ff9f2512dd42373760\``);
        await queryRunner.query(`ALTER TABLE \`bill\` DROP FOREIGN KEY \`FK_275fe11db713fd6f9fd62709917\``);
        await queryRunner.query(`ALTER TABLE \`payment\` DROP FOREIGN KEY \`FK_f8e64c2303f86d781d06bbd549c\``);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` DROP FOREIGN KEY \`FK_810f69863ba9687d164a0f9ea12\``);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` DROP FOREIGN KEY \`FK_0d77c4f45bd75ace23e89bc2004\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`showtime\``);
        await queryRunner.query(`DROP TABLE \`screen\``);
        await queryRunner.query(`DROP TABLE \`seat\``);
        await queryRunner.query(`DROP TABLE \`theater\``);
        await queryRunner.query(`DROP TABLE \`movie\``);
        await queryRunner.query(`DROP TABLE \`movie_genre\``);
        await queryRunner.query(`DROP INDEX \`IDX_dd8cd9e50dd049656e4be1f7e8\` ON \`genre\``);
        await queryRunner.query(`DROP TABLE \`genre\``);
        await queryRunner.query(`DROP TABLE \`review\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`bill\``);
        await queryRunner.query(`DROP TABLE \`payment\``);
        await queryRunner.query(`DROP INDEX \`IDX_280f82055c16b81ab2f90983f4\` ON \`group_role\``);
        await queryRunner.query(`DROP TABLE \`group_role\``);
        await queryRunner.query(`DROP TABLE \`group_role_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_240853a0c3353c25fb12434ad3\` ON \`permission\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
    }

}
