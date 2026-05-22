using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Order.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateShippingAddressCountry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE "Orders"
                SET "ShippingAddress_Country" = CASE
                    WHEN "ShippingAddress_Country" IS NULL OR btrim("ShippingAddress_Country") = '' THEN NULL
                    WHEN upper(btrim("ShippingAddress_Country")) IN ('US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA') THEN 'US'
                    ELSE 'VN'
                END
                WHERE "ShippingAddress_Country" IS NULL
                    OR upper(btrim("ShippingAddress_Country")) NOT IN ('VN', 'US')
                    OR length(btrim("ShippingAddress_Country")) > 2;
                """);

            migrationBuilder.AlterColumn<string>(
                name: "ShippingAddress_Country",
                table: "Orders",
                type: "character varying(2)",
                maxLength: 2,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ShippingAddress_Country",
                table: "Orders",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(2)",
                oldMaxLength: 2,
                oldNullable: true);
        }
    }
}
