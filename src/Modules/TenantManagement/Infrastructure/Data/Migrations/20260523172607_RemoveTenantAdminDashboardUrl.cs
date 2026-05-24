using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenantManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTenantAdminDashboardUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminDashboardUrl",
                table: "Tenants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminDashboardUrl",
                table: "Tenants",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");
        }
    }
}
