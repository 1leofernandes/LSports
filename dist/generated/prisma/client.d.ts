import * as runtime from "@prisma/client/runtime/client";
import * as $Class from "./internal/class";
import * as Prisma from "./internal/prismaNamespace";
export * as $Enums from './enums';
export * from "./enums";
/**
 * ## Prisma Client
 *
 * Type-safe database client for TypeScript
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tenants
 * const tenants = await prisma.tenant.findMany()
 * ```
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export declare const PrismaClient: $Class.PrismaClientConstructor;
export type PrismaClient<LogOpts extends Prisma.LogLevel = never, OmitOpts extends Prisma.PrismaClientOptions["omit"] = Prisma.PrismaClientOptions["omit"], ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = $Class.PrismaClient<LogOpts, OmitOpts, ExtArgs>;
export { Prisma };
/**
 * Model Tenant
 *
 */
export type Tenant = Prisma.TenantModel;
/**
 * Model User
 *
 */
export type User = Prisma.UserModel;
/**
 * Model Appointment
 *
 */
export type Appointment = Prisma.AppointmentModel;
/**
 * Model Block
 *
 */
export type Block = Prisma.BlockModel;
/**
 * Model RecurringBlock
 *
 */
export type RecurringBlock = Prisma.RecurringBlockModel;
//# sourceMappingURL=client.d.ts.map