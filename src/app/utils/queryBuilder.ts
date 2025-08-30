/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { FilterQuery, Query } from "mongoose";
import { excludeField } from "../constant";

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public readonly query: Record<string, string>;
    private filterObject: FilterQuery<T> = {};

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }

    filter(): this {
        const filter = { ...this.query };

        for (const field of excludeField) {
            delete filter[field];
        }

        this.modelQuery = this.modelQuery.find(filter);
        return this;
    }

    search(searchAbleField: string[]): this {
        const searchTerm = this.query.searchTerm || '';
        const searchQuery = {
            $or: searchAbleField.map(field => ({ [field]: { $regex: searchTerm, $options: 'i' } }))
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }

    sort(): this {
        const sortBy = this.query.sortBy || '-createdAt';
        const sortOrder = this.query.sortOrder === 'asc' ? '' : '-';
        this.modelQuery = this.modelQuery.sort(sortOrder + sortBy);
        return this;
    }

    paginate(): this {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit;

        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }

    getFilter(): FilterQuery<T> {
        return this.filterObject;
    }

    async exec() {
        return await this.modelQuery;
    }

}