using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TenantManagement.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantArchiveFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Tenants",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Tenants");
        }
    }
}
