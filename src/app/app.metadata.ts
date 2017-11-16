export interface Uri { }

export class NavLink {
    
    text: string;
    href: Uri;
    auth: boolean;
}

export class NavLinkGroup extends Array<NavLink> {
    
    constructor() {
        
        super();
    }
}