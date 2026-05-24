using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenantManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantAdminAccountLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminEmail",
                table: "Tenants",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AdminIdentityUserId",
                table: "Tenants",
                type: "character varying(450)",
                maxLength: 450,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminEmail",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "AdminIdentityUserId",
                table: "Tenants");
        }
    }
}
