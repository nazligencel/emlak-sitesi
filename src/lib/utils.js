import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export function slugify(text) {
    if (!text) return '';
    const trMap = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o'
    };
    return text
        .toString()
        .toLowerCase()
        .replace(/[çğşüıö]/g, match => trMap[match])
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}
