
    export type RemoteKeys = 'auth/LoginForm' | 'auth/UserMenu';
    type PackageType<T> = T extends 'auth/UserMenu' ? typeof import('auth/UserMenu') :T extends 'auth/LoginForm' ? typeof import('auth/LoginForm') :any;