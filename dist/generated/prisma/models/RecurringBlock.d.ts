import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
/**
 * Model RecurringBlock
 *
 */
export type RecurringBlockModel = runtime.Types.Result.DefaultSelection<Prisma.$RecurringBlockPayload>;
export type AggregateRecurringBlock = {
    _count: RecurringBlockCountAggregateOutputType | null;
    _avg: RecurringBlockAvgAggregateOutputType | null;
    _sum: RecurringBlockSumAggregateOutputType | null;
    _min: RecurringBlockMinAggregateOutputType | null;
    _max: RecurringBlockMaxAggregateOutputType | null;
};
export type RecurringBlockAvgAggregateOutputType = {
    id: number | null;
    tenantId: number | null;
    dayOfWeek: number | null;
};
export type RecurringBlockSumAggregateOutputType = {
    id: number | null;
    tenantId: number | null;
    dayOfWeek: number | null;
};
export type RecurringBlockMinAggregateOutputType = {
    id: number | null;
    tenantId: number | null;
    dayOfWeek: number | null;
    startTime: string | null;
    endTime: string | null;
    court: string | null;
    name: string | null;
    createdAt: Date | null;
};
export type RecurringBlockMaxAggregateOutputType = {
    id: number | null;
    tenantId: number | null;
    dayOfWeek: number | null;
    startTime: string | null;
    endTime: string | null;
    court: string | null;
    name: string | null;
    createdAt: Date | null;
};
export type RecurringBlockCountAggregateOutputType = {
    id: number;
    tenantId: number;
    dayOfWeek: number;
    startTime: number;
    endTime: number;
    court: number;
    name: number;
    createdAt: number;
    _all: number;
};
export type RecurringBlockAvgAggregateInputType = {
    id?: true;
    tenantId?: true;
    dayOfWeek?: true;
};
export type RecurringBlockSumAggregateInputType = {
    id?: true;
    tenantId?: true;
    dayOfWeek?: true;
};
export type RecurringBlockMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    dayOfWeek?: true;
    startTime?: true;
    endTime?: true;
    court?: true;
    name?: true;
    createdAt?: true;
};
export type RecurringBlockMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    dayOfWeek?: true;
    startTime?: true;
    endTime?: true;
    court?: true;
    name?: true;
    createdAt?: true;
};
export type RecurringBlockCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    dayOfWeek?: true;
    startTime?: true;
    endTime?: true;
    court?: true;
    name?: true;
    createdAt?: true;
    _all?: true;
};
export type RecurringBlockAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RecurringBlock to aggregate.
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RecurringBlocks to fetch.
     */
    orderBy?: Prisma.RecurringBlockOrderByWithRelationInput | Prisma.RecurringBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.RecurringBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RecurringBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RecurringBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned RecurringBlocks
    **/
    _count?: true | RecurringBlockCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: RecurringBlockAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: RecurringBlockSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: RecurringBlockMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: RecurringBlockMaxAggregateInputType;
};
export type GetRecurringBlockAggregateType<T extends RecurringBlockAggregateArgs> = {
    [P in keyof T & keyof AggregateRecurringBlock]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRecurringBlock[P]> : Prisma.GetScalarType<T[P], AggregateRecurringBlock[P]>;
};
export type RecurringBlockGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RecurringBlockWhereInput;
    orderBy?: Prisma.RecurringBlockOrderByWithAggregationInput | Prisma.RecurringBlockOrderByWithAggregationInput[];
    by: Prisma.RecurringBlockScalarFieldEnum[] | Prisma.RecurringBlockScalarFieldEnum;
    having?: Prisma.RecurringBlockScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RecurringBlockCountAggregateInputType | true;
    _avg?: RecurringBlockAvgAggregateInputType;
    _sum?: RecurringBlockSumAggregateInputType;
    _min?: RecurringBlockMinAggregateInputType;
    _max?: RecurringBlockMaxAggregateInputType;
};
export type RecurringBlockGroupByOutputType = {
    id: number;
    tenantId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name: string | null;
    createdAt: Date;
    _count: RecurringBlockCountAggregateOutputType | null;
    _avg: RecurringBlockAvgAggregateOutputType | null;
    _sum: RecurringBlockSumAggregateOutputType | null;
    _min: RecurringBlockMinAggregateOutputType | null;
    _max: RecurringBlockMaxAggregateOutputType | null;
};
type GetRecurringBlockGroupByPayload<T extends RecurringBlockGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RecurringBlockGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RecurringBlockGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RecurringBlockGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RecurringBlockGroupByOutputType[P]>;
}>>;
export type RecurringBlockWhereInput = {
    AND?: Prisma.RecurringBlockWhereInput | Prisma.RecurringBlockWhereInput[];
    OR?: Prisma.RecurringBlockWhereInput[];
    NOT?: Prisma.RecurringBlockWhereInput | Prisma.RecurringBlockWhereInput[];
    id?: Prisma.IntFilter<"RecurringBlock"> | number;
    tenantId?: Prisma.IntFilter<"RecurringBlock"> | number;
    dayOfWeek?: Prisma.IntFilter<"RecurringBlock"> | number;
    startTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    endTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    court?: Prisma.StringFilter<"RecurringBlock"> | string;
    name?: Prisma.StringNullableFilter<"RecurringBlock"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"RecurringBlock"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
};
export type RecurringBlockOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    court?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    tenant?: Prisma.TenantOrderByWithRelationInput;
};
export type RecurringBlockWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.RecurringBlockWhereInput | Prisma.RecurringBlockWhereInput[];
    OR?: Prisma.RecurringBlockWhereInput[];
    NOT?: Prisma.RecurringBlockWhereInput | Prisma.RecurringBlockWhereInput[];
    tenantId?: Prisma.IntFilter<"RecurringBlock"> | number;
    dayOfWeek?: Prisma.IntFilter<"RecurringBlock"> | number;
    startTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    endTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    court?: Prisma.StringFilter<"RecurringBlock"> | string;
    name?: Prisma.StringNullableFilter<"RecurringBlock"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"RecurringBlock"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
}, "id">;
export type RecurringBlockOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    court?: Prisma.SortOrder;
    name?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.RecurringBlockCountOrderByAggregateInput;
    _avg?: Prisma.RecurringBlockAvgOrderByAggregateInput;
    _max?: Prisma.RecurringBlockMaxOrderByAggregateInput;
    _min?: Prisma.RecurringBlockMinOrderByAggregateInput;
    _sum?: Prisma.RecurringBlockSumOrderByAggregateInput;
};
export type RecurringBlockScalarWhereWithAggregatesInput = {
    AND?: Prisma.RecurringBlockScalarWhereWithAggregatesInput | Prisma.RecurringBlockScalarWhereWithAggregatesInput[];
    OR?: Prisma.RecurringBlockScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RecurringBlockScalarWhereWithAggregatesInput | Prisma.RecurringBlockScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"RecurringBlock"> | number;
    tenantId?: Prisma.IntWithAggregatesFilter<"RecurringBlock"> | number;
    dayOfWeek?: Prisma.IntWithAggregatesFilter<"RecurringBlock"> | number;
    startTime?: Prisma.StringWithAggregatesFilter<"RecurringBlock"> | string;
    endTime?: Prisma.StringWithAggregatesFilter<"RecurringBlock"> | string;
    court?: Prisma.StringWithAggregatesFilter<"RecurringBlock"> | string;
    name?: Prisma.StringNullableWithAggregatesFilter<"RecurringBlock"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"RecurringBlock"> | Date | string;
};
export type RecurringBlockCreateInput = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutRecurringBlocksInput;
};
export type RecurringBlockUncheckedCreateInput = {
    id?: number;
    tenantId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type RecurringBlockUpdateInput = {
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutRecurringBlocksNestedInput;
};
export type RecurringBlockUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tenantId?: Prisma.IntFieldUpdateOperationsInput | number;
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockCreateManyInput = {
    id?: number;
    tenantId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type RecurringBlockUpdateManyMutationInput = {
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    tenantId?: Prisma.IntFieldUpdateOperationsInput | number;
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockListRelationFilter = {
    every?: Prisma.RecurringBlockWhereInput;
    some?: Prisma.RecurringBlockWhereInput;
    none?: Prisma.RecurringBlockWhereInput;
};
export type RecurringBlockOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RecurringBlockCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    court?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RecurringBlockAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
};
export type RecurringBlockMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    court?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RecurringBlockMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
    startTime?: Prisma.SortOrder;
    endTime?: Prisma.SortOrder;
    court?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type RecurringBlockSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    dayOfWeek?: Prisma.SortOrder;
};
export type RecurringBlockCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput> | Prisma.RecurringBlockCreateWithoutTenantInput[] | Prisma.RecurringBlockUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RecurringBlockCreateOrConnectWithoutTenantInput | Prisma.RecurringBlockCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.RecurringBlockCreateManyTenantInputEnvelope;
    connect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
};
export type RecurringBlockUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput> | Prisma.RecurringBlockCreateWithoutTenantInput[] | Prisma.RecurringBlockUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RecurringBlockCreateOrConnectWithoutTenantInput | Prisma.RecurringBlockCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.RecurringBlockCreateManyTenantInputEnvelope;
    connect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
};
export type RecurringBlockUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput> | Prisma.RecurringBlockCreateWithoutTenantInput[] | Prisma.RecurringBlockUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RecurringBlockCreateOrConnectWithoutTenantInput | Prisma.RecurringBlockCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.RecurringBlockUpsertWithWhereUniqueWithoutTenantInput | Prisma.RecurringBlockUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.RecurringBlockCreateManyTenantInputEnvelope;
    set?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    disconnect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    delete?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    connect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    update?: Prisma.RecurringBlockUpdateWithWhereUniqueWithoutTenantInput | Prisma.RecurringBlockUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.RecurringBlockUpdateManyWithWhereWithoutTenantInput | Prisma.RecurringBlockUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.RecurringBlockScalarWhereInput | Prisma.RecurringBlockScalarWhereInput[];
};
export type RecurringBlockUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput> | Prisma.RecurringBlockCreateWithoutTenantInput[] | Prisma.RecurringBlockUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.RecurringBlockCreateOrConnectWithoutTenantInput | Prisma.RecurringBlockCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.RecurringBlockUpsertWithWhereUniqueWithoutTenantInput | Prisma.RecurringBlockUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.RecurringBlockCreateManyTenantInputEnvelope;
    set?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    disconnect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    delete?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    connect?: Prisma.RecurringBlockWhereUniqueInput | Prisma.RecurringBlockWhereUniqueInput[];
    update?: Prisma.RecurringBlockUpdateWithWhereUniqueWithoutTenantInput | Prisma.RecurringBlockUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.RecurringBlockUpdateManyWithWhereWithoutTenantInput | Prisma.RecurringBlockUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.RecurringBlockScalarWhereInput | Prisma.RecurringBlockScalarWhereInput[];
};
export type RecurringBlockCreateWithoutTenantInput = {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type RecurringBlockUncheckedCreateWithoutTenantInput = {
    id?: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type RecurringBlockCreateOrConnectWithoutTenantInput = {
    where: Prisma.RecurringBlockWhereUniqueInput;
    create: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput>;
};
export type RecurringBlockCreateManyTenantInputEnvelope = {
    data: Prisma.RecurringBlockCreateManyTenantInput | Prisma.RecurringBlockCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type RecurringBlockUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.RecurringBlockWhereUniqueInput;
    update: Prisma.XOR<Prisma.RecurringBlockUpdateWithoutTenantInput, Prisma.RecurringBlockUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.RecurringBlockCreateWithoutTenantInput, Prisma.RecurringBlockUncheckedCreateWithoutTenantInput>;
};
export type RecurringBlockUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.RecurringBlockWhereUniqueInput;
    data: Prisma.XOR<Prisma.RecurringBlockUpdateWithoutTenantInput, Prisma.RecurringBlockUncheckedUpdateWithoutTenantInput>;
};
export type RecurringBlockUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.RecurringBlockScalarWhereInput;
    data: Prisma.XOR<Prisma.RecurringBlockUpdateManyMutationInput, Prisma.RecurringBlockUncheckedUpdateManyWithoutTenantInput>;
};
export type RecurringBlockScalarWhereInput = {
    AND?: Prisma.RecurringBlockScalarWhereInput | Prisma.RecurringBlockScalarWhereInput[];
    OR?: Prisma.RecurringBlockScalarWhereInput[];
    NOT?: Prisma.RecurringBlockScalarWhereInput | Prisma.RecurringBlockScalarWhereInput[];
    id?: Prisma.IntFilter<"RecurringBlock"> | number;
    tenantId?: Prisma.IntFilter<"RecurringBlock"> | number;
    dayOfWeek?: Prisma.IntFilter<"RecurringBlock"> | number;
    startTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    endTime?: Prisma.StringFilter<"RecurringBlock"> | string;
    court?: Prisma.StringFilter<"RecurringBlock"> | string;
    name?: Prisma.StringNullableFilter<"RecurringBlock"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"RecurringBlock"> | Date | string;
};
export type RecurringBlockCreateManyTenantInput = {
    id?: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    court: string;
    name?: string | null;
    createdAt?: Date | string;
};
export type RecurringBlockUpdateWithoutTenantInput = {
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    dayOfWeek?: Prisma.IntFieldUpdateOperationsInput | number;
    startTime?: Prisma.StringFieldUpdateOperationsInput | string;
    endTime?: Prisma.StringFieldUpdateOperationsInput | string;
    court?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RecurringBlockSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    dayOfWeek?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    court?: boolean;
    name?: boolean;
    createdAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["recurringBlock"]>;
export type RecurringBlockSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    dayOfWeek?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    court?: boolean;
    name?: boolean;
    createdAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["recurringBlock"]>;
export type RecurringBlockSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    dayOfWeek?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    court?: boolean;
    name?: boolean;
    createdAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["recurringBlock"]>;
export type RecurringBlockSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    dayOfWeek?: boolean;
    startTime?: boolean;
    endTime?: boolean;
    court?: boolean;
    name?: boolean;
    createdAt?: boolean;
};
export type RecurringBlockOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "dayOfWeek" | "startTime" | "endTime" | "court" | "name" | "createdAt", ExtArgs["result"]["recurringBlock"]>;
export type RecurringBlockInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type RecurringBlockIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type RecurringBlockIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type $RecurringBlockPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "RecurringBlock";
    objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        tenantId: number;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
        court: string;
        name: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["recurringBlock"]>;
    composites: {};
};
export type RecurringBlockGetPayload<S extends boolean | null | undefined | RecurringBlockDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload, S>;
export type RecurringBlockCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RecurringBlockFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RecurringBlockCountAggregateInputType | true;
};
export interface RecurringBlockDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['RecurringBlock'];
        meta: {
            name: 'RecurringBlock';
        };
    };
    /**
     * Find zero or one RecurringBlock that matches the filter.
     * @param {RecurringBlockFindUniqueArgs} args - Arguments to find a RecurringBlock
     * @example
     * // Get one RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RecurringBlockFindUniqueArgs>(args: Prisma.SelectSubset<T, RecurringBlockFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one RecurringBlock that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RecurringBlockFindUniqueOrThrowArgs} args - Arguments to find a RecurringBlock
     * @example
     * // Get one RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RecurringBlockFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RecurringBlockFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RecurringBlock that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockFindFirstArgs} args - Arguments to find a RecurringBlock
     * @example
     * // Get one RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RecurringBlockFindFirstArgs>(args?: Prisma.SelectSubset<T, RecurringBlockFindFirstArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first RecurringBlock that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockFindFirstOrThrowArgs} args - Arguments to find a RecurringBlock
     * @example
     * // Get one RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RecurringBlockFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RecurringBlockFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more RecurringBlocks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RecurringBlocks
     * const recurringBlocks = await prisma.recurringBlock.findMany()
     *
     * // Get first 10 RecurringBlocks
     * const recurringBlocks = await prisma.recurringBlock.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const recurringBlockWithIdOnly = await prisma.recurringBlock.findMany({ select: { id: true } })
     *
     */
    findMany<T extends RecurringBlockFindManyArgs>(args?: Prisma.SelectSubset<T, RecurringBlockFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a RecurringBlock.
     * @param {RecurringBlockCreateArgs} args - Arguments to create a RecurringBlock.
     * @example
     * // Create one RecurringBlock
     * const RecurringBlock = await prisma.recurringBlock.create({
     *   data: {
     *     // ... data to create a RecurringBlock
     *   }
     * })
     *
     */
    create<T extends RecurringBlockCreateArgs>(args: Prisma.SelectSubset<T, RecurringBlockCreateArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many RecurringBlocks.
     * @param {RecurringBlockCreateManyArgs} args - Arguments to create many RecurringBlocks.
     * @example
     * // Create many RecurringBlocks
     * const recurringBlock = await prisma.recurringBlock.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends RecurringBlockCreateManyArgs>(args?: Prisma.SelectSubset<T, RecurringBlockCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many RecurringBlocks and returns the data saved in the database.
     * @param {RecurringBlockCreateManyAndReturnArgs} args - Arguments to create many RecurringBlocks.
     * @example
     * // Create many RecurringBlocks
     * const recurringBlock = await prisma.recurringBlock.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many RecurringBlocks and only return the `id`
     * const recurringBlockWithIdOnly = await prisma.recurringBlock.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends RecurringBlockCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RecurringBlockCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a RecurringBlock.
     * @param {RecurringBlockDeleteArgs} args - Arguments to delete one RecurringBlock.
     * @example
     * // Delete one RecurringBlock
     * const RecurringBlock = await prisma.recurringBlock.delete({
     *   where: {
     *     // ... filter to delete one RecurringBlock
     *   }
     * })
     *
     */
    delete<T extends RecurringBlockDeleteArgs>(args: Prisma.SelectSubset<T, RecurringBlockDeleteArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one RecurringBlock.
     * @param {RecurringBlockUpdateArgs} args - Arguments to update one RecurringBlock.
     * @example
     * // Update one RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends RecurringBlockUpdateArgs>(args: Prisma.SelectSubset<T, RecurringBlockUpdateArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more RecurringBlocks.
     * @param {RecurringBlockDeleteManyArgs} args - Arguments to filter RecurringBlocks to delete.
     * @example
     * // Delete a few RecurringBlocks
     * const { count } = await prisma.recurringBlock.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends RecurringBlockDeleteManyArgs>(args?: Prisma.SelectSubset<T, RecurringBlockDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RecurringBlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RecurringBlocks
     * const recurringBlock = await prisma.recurringBlock.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends RecurringBlockUpdateManyArgs>(args: Prisma.SelectSubset<T, RecurringBlockUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more RecurringBlocks and returns the data updated in the database.
     * @param {RecurringBlockUpdateManyAndReturnArgs} args - Arguments to update many RecurringBlocks.
     * @example
     * // Update many RecurringBlocks
     * const recurringBlock = await prisma.recurringBlock.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more RecurringBlocks and only return the `id`
     * const recurringBlockWithIdOnly = await prisma.recurringBlock.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends RecurringBlockUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RecurringBlockUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one RecurringBlock.
     * @param {RecurringBlockUpsertArgs} args - Arguments to update or create a RecurringBlock.
     * @example
     * // Update or create a RecurringBlock
     * const recurringBlock = await prisma.recurringBlock.upsert({
     *   create: {
     *     // ... data to create a RecurringBlock
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RecurringBlock we want to update
     *   }
     * })
     */
    upsert<T extends RecurringBlockUpsertArgs>(args: Prisma.SelectSubset<T, RecurringBlockUpsertArgs<ExtArgs>>): Prisma.Prisma__RecurringBlockClient<runtime.Types.Result.GetResult<Prisma.$RecurringBlockPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of RecurringBlocks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockCountArgs} args - Arguments to filter RecurringBlocks to count.
     * @example
     * // Count the number of RecurringBlocks
     * const count = await prisma.recurringBlock.count({
     *   where: {
     *     // ... the filter for the RecurringBlocks we want to count
     *   }
     * })
    **/
    count<T extends RecurringBlockCountArgs>(args?: Prisma.Subset<T, RecurringBlockCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RecurringBlockCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a RecurringBlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RecurringBlockAggregateArgs>(args: Prisma.Subset<T, RecurringBlockAggregateArgs>): Prisma.PrismaPromise<GetRecurringBlockAggregateType<T>>;
    /**
     * Group by RecurringBlock.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RecurringBlockGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends RecurringBlockGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RecurringBlockGroupByArgs['orderBy'];
    } : {
        orderBy?: RecurringBlockGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RecurringBlockGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRecurringBlockGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the RecurringBlock model
     */
    readonly fields: RecurringBlockFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for RecurringBlock.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__RecurringBlockClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the RecurringBlock model
 */
export interface RecurringBlockFieldRefs {
    readonly id: Prisma.FieldRef<"RecurringBlock", 'Int'>;
    readonly tenantId: Prisma.FieldRef<"RecurringBlock", 'Int'>;
    readonly dayOfWeek: Prisma.FieldRef<"RecurringBlock", 'Int'>;
    readonly startTime: Prisma.FieldRef<"RecurringBlock", 'String'>;
    readonly endTime: Prisma.FieldRef<"RecurringBlock", 'String'>;
    readonly court: Prisma.FieldRef<"RecurringBlock", 'String'>;
    readonly name: Prisma.FieldRef<"RecurringBlock", 'String'>;
    readonly createdAt: Prisma.FieldRef<"RecurringBlock", 'DateTime'>;
}
/**
 * RecurringBlock findUnique
 */
export type RecurringBlockFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter, which RecurringBlock to fetch.
     */
    where: Prisma.RecurringBlockWhereUniqueInput;
};
/**
 * RecurringBlock findUniqueOrThrow
 */
export type RecurringBlockFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter, which RecurringBlock to fetch.
     */
    where: Prisma.RecurringBlockWhereUniqueInput;
};
/**
 * RecurringBlock findFirst
 */
export type RecurringBlockFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter, which RecurringBlock to fetch.
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RecurringBlocks to fetch.
     */
    orderBy?: Prisma.RecurringBlockOrderByWithRelationInput | Prisma.RecurringBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RecurringBlocks.
     */
    cursor?: Prisma.RecurringBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RecurringBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RecurringBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RecurringBlocks.
     */
    distinct?: Prisma.RecurringBlockScalarFieldEnum | Prisma.RecurringBlockScalarFieldEnum[];
};
/**
 * RecurringBlock findFirstOrThrow
 */
export type RecurringBlockFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter, which RecurringBlock to fetch.
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RecurringBlocks to fetch.
     */
    orderBy?: Prisma.RecurringBlockOrderByWithRelationInput | Prisma.RecurringBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for RecurringBlocks.
     */
    cursor?: Prisma.RecurringBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RecurringBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RecurringBlocks.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of RecurringBlocks.
     */
    distinct?: Prisma.RecurringBlockScalarFieldEnum | Prisma.RecurringBlockScalarFieldEnum[];
};
/**
 * RecurringBlock findMany
 */
export type RecurringBlockFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter, which RecurringBlocks to fetch.
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of RecurringBlocks to fetch.
     */
    orderBy?: Prisma.RecurringBlockOrderByWithRelationInput | Prisma.RecurringBlockOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing RecurringBlocks.
     */
    cursor?: Prisma.RecurringBlockWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` RecurringBlocks from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` RecurringBlocks.
     */
    skip?: number;
    distinct?: Prisma.RecurringBlockScalarFieldEnum | Prisma.RecurringBlockScalarFieldEnum[];
};
/**
 * RecurringBlock create
 */
export type RecurringBlockCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * The data needed to create a RecurringBlock.
     */
    data: Prisma.XOR<Prisma.RecurringBlockCreateInput, Prisma.RecurringBlockUncheckedCreateInput>;
};
/**
 * RecurringBlock createMany
 */
export type RecurringBlockCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many RecurringBlocks.
     */
    data: Prisma.RecurringBlockCreateManyInput | Prisma.RecurringBlockCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * RecurringBlock createManyAndReturn
 */
export type RecurringBlockCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * The data used to create many RecurringBlocks.
     */
    data: Prisma.RecurringBlockCreateManyInput | Prisma.RecurringBlockCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * RecurringBlock update
 */
export type RecurringBlockUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * The data needed to update a RecurringBlock.
     */
    data: Prisma.XOR<Prisma.RecurringBlockUpdateInput, Prisma.RecurringBlockUncheckedUpdateInput>;
    /**
     * Choose, which RecurringBlock to update.
     */
    where: Prisma.RecurringBlockWhereUniqueInput;
};
/**
 * RecurringBlock updateMany
 */
export type RecurringBlockUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update RecurringBlocks.
     */
    data: Prisma.XOR<Prisma.RecurringBlockUpdateManyMutationInput, Prisma.RecurringBlockUncheckedUpdateManyInput>;
    /**
     * Filter which RecurringBlocks to update
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * Limit how many RecurringBlocks to update.
     */
    limit?: number;
};
/**
 * RecurringBlock updateManyAndReturn
 */
export type RecurringBlockUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * The data used to update RecurringBlocks.
     */
    data: Prisma.XOR<Prisma.RecurringBlockUpdateManyMutationInput, Prisma.RecurringBlockUncheckedUpdateManyInput>;
    /**
     * Filter which RecurringBlocks to update
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * Limit how many RecurringBlocks to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * RecurringBlock upsert
 */
export type RecurringBlockUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * The filter to search for the RecurringBlock to update in case it exists.
     */
    where: Prisma.RecurringBlockWhereUniqueInput;
    /**
     * In case the RecurringBlock found by the `where` argument doesn't exist, create a new RecurringBlock with this data.
     */
    create: Prisma.XOR<Prisma.RecurringBlockCreateInput, Prisma.RecurringBlockUncheckedCreateInput>;
    /**
     * In case the RecurringBlock was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.RecurringBlockUpdateInput, Prisma.RecurringBlockUncheckedUpdateInput>;
};
/**
 * RecurringBlock delete
 */
export type RecurringBlockDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
    /**
     * Filter which RecurringBlock to delete.
     */
    where: Prisma.RecurringBlockWhereUniqueInput;
};
/**
 * RecurringBlock deleteMany
 */
export type RecurringBlockDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which RecurringBlocks to delete
     */
    where?: Prisma.RecurringBlockWhereInput;
    /**
     * Limit how many RecurringBlocks to delete.
     */
    limit?: number;
};
/**
 * RecurringBlock without action
 */
export type RecurringBlockDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RecurringBlock
     */
    select?: Prisma.RecurringBlockSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the RecurringBlock
     */
    omit?: Prisma.RecurringBlockOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.RecurringBlockInclude<ExtArgs> | null;
};
export {};
//# sourceMappingURL=RecurringBlock.d.ts.map