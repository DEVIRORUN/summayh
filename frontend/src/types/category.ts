export interface CategoryChild {
    id: string;
    name: string;
    slug: string;
}

export interface CategoryNode {
    id: string;
    name: string;
    slug: string;
    children?: CategoryChild[];
}