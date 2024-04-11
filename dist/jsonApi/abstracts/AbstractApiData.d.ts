import { ApiDataInterface } from "../interfaces/ApiDataInterface";
import { JsonApiHydratedDataInterface } from "../interfaces/JsonApiHydratedDataInterface";
export declare abstract class AbstractApiData implements ApiDataInterface {
    protected _jsonApi?: any;
    protected _included?: any[];
    protected _id?: string;
    protected _createdAt?: Date;
    protected _updatedAt?: Date;
    protected _self?: string;
    get id(): string;
    get self(): string | undefined;
    get createdAt(): Date | undefined;
    get updatedAt(): Date | undefined;
    get included(): any[];
    ingestJsonApi(data: JsonApiHydratedDataInterface): void;
    abstract generateApiUrl(params?: any): string;
    abstract createJsonApi(data: any): any;
    protected _readIncluded<T extends ApiDataInterface>(data: JsonApiHydratedDataInterface, type: string, dataType: string): T | T[];
    dehydrate(): JsonApiHydratedDataInterface;
    rehydrate(data: JsonApiHydratedDataInterface): this;
}
