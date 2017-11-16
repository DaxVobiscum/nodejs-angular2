export enum AuthAlertType {
    Info,
    Error,
    Success,
    Warn
};

export enum AuthLinkVisibility {
    ShowAuthenticated,
    ShowAnonymous,
    ShowAlways
};

export enum AuthMode {
    SignIn,
    SignOut,
    SignUp
};

export enum AuthErrorCode {
    Unknown,
    Internal,
    InvalidPassword,
    InvalidUser,
    DuplicateUser
};

export class AuthAlert {
    
    message: string;
    type: AuthAlertType;
    
    active: boolean = false;
    
    constructor(message: string, type: AuthAlertType) {
        
        this.message = message || "";
        this.type = type || AuthAlertType.Info;
    };
    
    static getDefault() {
        
        return new this("", AuthAlertType.Info);
    };
};

export class AuthError {
    
    code: AuthErrorCode;
    message: string;
    
    constructor(code: AuthErrorCode, message: string) {
        
        this.code = code || AuthErrorCode.Unknown;
        this.message = message || "";
    }
};

export class AuthLink {
    
    text: string;
    href: string;
    auth: boolean;
    show: AuthLinkVisibility;
};

export class AuthLinkGroup extends Array<AuthLink> {
    
    constructor() {
        
        super();
    };
};

export class User {
    
    constructor(public username: string = "", public token: string = "") { }
    
    asUser(): User {
        
        return new User(this.username, this.token);
    }
};

export class UserCreds extends User {
    
    password: string;
    
    constructor(username: string = "", password: string = "") {
        
        super(username);
        
        this.password = password;
    }
};

export class UserGoogle extends User {
    
    profile: any;
    token: string;
    
    constructor(profile: any, token: string) {
        
        super(profile.displayName, token);
        
        this.profile = profile;
    }
};