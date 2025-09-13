interface Vendor {
    id:string;
    vendorId?:string;
    name:string;
    category: Array<string>;
    subcategory?:string;
    location:string;
    rating:number;
    reviews:number;
    image:string;
    featured:boolean;
    price?:PricingCategory;
    videos?:Array<string>;
    description?:string;
    phone?:string;
    folderId?:string;
}


export enum PricingCategory {
    basic= "Basic" , standard ="Standard", premium = "Premium"
}

export default Vendor;