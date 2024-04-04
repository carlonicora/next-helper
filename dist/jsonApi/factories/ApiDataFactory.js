"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiDataFactory = void 0;
class ApiDataFactory {
    static registerObjectClass(key, classConstructor) {
        if (!this.classMap.has(key))
            this.classMap.set(key, classConstructor);
    }
    static async _request(method, classKey, params, body) {
        const factoryClass = this.classMap.get(classKey);
        if (!factoryClass) {
            throw new Error(`Class not registered for key: ${classKey}`);
        }
        const response = {
            ok: true,
            response: 0,
            data: [],
            error: "",
        };
        let link = params?.link;
        if (!link)
            link = new factoryClass().generateApiUrl(params);
        let token = undefined;
        if (typeof window === "undefined") {
            const serverCookies = await Promise.resolve().then(() => __importStar(require("next/headers")));
            const cookieStore = serverCookies.cookies();
            token =
                cookieStore.get("next-auth.session-token")?.value ??
                    cookieStore.get("__Secure-next-auth.session-token")?.value ??
                    undefined;
            if (!link.startsWith("http"))
                link = process.env.NEXT_PUBLIC_API_URL + link;
        }
        else {
            if (link.startsWith("http"))
                link = link.substring(process.env.NEXT_PUBLIC_API_URL?.length ?? 0);
            link =
                process.env.NEXT_PUBLIC_INTERNAL_API_URL +
                    "?uri=" +
                    encodeURIComponent(link);
        }
        const options = {
            method: method,
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: body ? JSON.stringify(body) : undefined,
        };
        if (params?.headers)
            Object.assign(options.headers, params.headers);
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }
        const apiResponse = await fetch(link, options);
        response.ok = apiResponse.ok;
        response.response = apiResponse.status;
        if (!apiResponse.ok) {
            response.error = apiResponse.statusText;
            return response;
        }
        if (apiResponse.status === 204)
            return response;
        try {
            const jsonApi = await apiResponse.json();
            const included = jsonApi.included ?? [];
            if (jsonApi.links) {
                response.self = jsonApi.links.self;
                if (jsonApi.links.next) {
                    response.next = jsonApi.links.next;
                    response.nextPage = async () => ApiDataFactory.get(classKey, { link: jsonApi.links.next });
                }
                if (jsonApi.links.prev) {
                    response.prev = jsonApi.links.prev;
                    response.prevPage = async () => ApiDataFactory.get(classKey, { link: jsonApi.links.prev });
                }
            }
            if (Array.isArray(jsonApi.data)) {
                const responseData = [];
                for (const data of jsonApi.data) {
                    const object = new factoryClass();
                    object.rehydrate({ jsonApi: data, included: included });
                    responseData.push(object);
                }
                response.data = responseData;
            }
            else {
                const responseData = new factoryClass();
                responseData.rehydrate({ jsonApi: jsonApi.data, included: included });
                response.data = responseData;
            }
        }
        catch (e) {
            console.error(e);
        }
        return response;
    }
    static async get(classKey, params) {
        return this._request("GET", classKey, params);
    }
    static async getData(classKey, params) {
        const data = await this.get(classKey, params);
        if (!data.ok)
            throw new Error(data.error);
        return data.data;
    }
    static async post(classKey, params, body) {
        if (!body)
            body = {};
        return this._request("POST", classKey, params, body);
    }
    static async put(classKey, params, body) {
        return this._request("PUT", classKey, params, body);
    }
    static async patch(classKey, params, body) {
        return this._request("PATCH", classKey, params, body);
    }
    static async delete(classKey, params) {
        return this._request("DELETE", classKey, params);
    }
}
exports.ApiDataFactory = ApiDataFactory;
ApiDataFactory.classMap = new Map();
//# sourceMappingURL=ApiDataFactory.js.map