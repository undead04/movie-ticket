import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1734758843532 implements MigrationInterface {
    name = 'Migrations1734758843532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_240853a0c3353c25fb12434ad3\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_role_permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`groupRoleId\` int NULL, \`permissionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`group_role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE INDEX \`IDX_280f82055c16b81ab2f90983f4\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`bill\` (\`id\` int NOT NULL AUTO_INCREMENT, \`orderCode\` varchar(255) NOT NULL, \`totalPrice\` decimal(10,2) NOT NULL, \`statusOrder\` int NOT NULL DEFAULT '1', \`bookingTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`reservation_time\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`expiration_time\` datetime NOT NULL, \`paymentMethod\` varchar(255) NOT NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL, \`password_hash\` varchar(255) NOT NULL, \`email\` varchar(100) NOT NULL, \`phone\` varchar(15) NULL, \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`groupRoleId\` int NULL, UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`review\` (\`id\` int NOT NULL AUTO_INCREMENT, \`rating\` int(1) NOT NULL, \`comment\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`movieId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`description\` text NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`update_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dd8cd9e50dd049656e4be1f7e8\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie_genre\` (\`id\` int NOT NULL AUTO_INCREMENT, \`genreId\` int NULL, \`movieId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`movie\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`description\` text NULL, \`duration\` int NOT NULL, \`trailerUrl\` varchar(255) NULL, \`posterUrl\` varchar(255) NULL, \`releaseDate\` date NULL, \`endDate\` date NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`theater\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(50) NOT NULL, \`address\` varchar(50) NOT NULL, \`city\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_45d17dd0768b4a262be4b79065\` (\`name\`), UNIQUE INDEX \`IDX_76d3882a77a31043b5a5672769\` (\`address\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`seat\` (\`id\` int NOT NULL AUTO_INCREMENT, \`seatNumber\` text NOT NULL, \`row\` int NOT NULL, \`col\` int NOT NULL, \`screenId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`screen\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` text NOT NULL, \`seatCapacity\` int UNSIGNED NOT NULL, \`theaterId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`showtime\` (\`id\` int NOT NULL AUTO_INCREMENT, \`showDate\` date NOT NULL, \`startTime\` time NOT NULL, \`endTime\` time NOT NULL, \`price\` decimal(10,2) NOT NULL, \`movieId\` int NULL, \`screenId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`ticket\` (\`id\` int NOT NULL AUTO_INCREMENT, \`showtimeId\` int NULL, \`seatId\` int NULL, \`billId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` ADD CONSTRAINT \`FK_542fcdecad4a79dbee3bbe27250\` FOREIGN KEY (\`groupRoleId\`) REFERENCES \`group_role\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` ADD CONSTRAINT \`FK_83ebabf176958d675e0a73892be\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`bill\` ADD CONSTRAINT \`FK_275fe11db713fd6f9fd62709917\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_88ff32ea732221f2c9ed3818908\` FOREIGN KEY (\`groupRoleId\`) REFERENCES \`group_role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_1337f93918c70837d3cea105d39\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`review\` ADD CONSTRAINT \`FK_4ccf71f9d14aa1a059877b06343\` FOREIGN KEY (\`movieId\`) REFERENCES \`movie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` ADD CONSTRAINT \`FK_f641f620b3fe496553aa442b026\` FOREIGN KEY (\`genreId\`) REFERENCES \`genre\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`movie_genre\` ADD CONSTRAINT \`FK_89ab58f5defce509fa9acffa723\` FOREIGN KEY (\`movieId\`) REFERENCES \`movie\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
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
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_88ff32ea732221f2c9ed3818908\``);
        await queryRunner.query(`ALTER TABLE \`bill\` DROP FOREIGN KEY \`FK_275fe11db713fd6f9fd62709917\``);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` DROP FOREIGN KEY \`FK_83ebabf176958d675e0a73892be\``);
        await queryRunner.query(`ALTER TABLE \`group_role_permission\` DROP FOREIGN KEY \`FK_542fcdecad4a79dbee3bbe27250\``);
        await queryRunner.query(`DROP TABLE \`ticket\``);
        await queryRunner.query(`DROP TABLE \`showtime\``);
        await queryRunner.query(`DROP TABLE \`screen\``);
        await queryRunner.query(`DROP TABLE \`seat\``);
        await queryRunner.query(`DROP INDEX \`IDX_76d3882a77a31043b5a5672769\` ON \`theater\``);
        await queryRunner.query(`DROP INDEX \`IDX_45d17dd0768b4a262be4b79065\` ON \`theater\``);
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
        await queryRunner.query(`DROP INDEX \`IDX_280f82055c16b81ab2f90983f4\` ON \`group_role\``);
        await queryRunner.query(`DROP TABLE \`group_role\``);
        await queryRunner.query(`DROP TABLE \`group_role_permission\``);
        await queryRunner.query(`DROP INDEX \`IDX_240853a0c3353c25fb12434ad3\` ON \`permission\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
    }

}
