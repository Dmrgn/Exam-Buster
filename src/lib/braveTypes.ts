export interface BraveRoot {
    query: Query
    mixed: Mixed
    news: News
    type: string
    videos: Videos
    web: Web
}

export interface Query {
    original: string
    show_strict_warning: boolean
    is_navigational: boolean
    is_news_breaking: boolean
    spellcheck_off: boolean
    country: string
    bad_results: boolean
    should_fallback: boolean
    postal_code: string
    city: string
    header_country: string
    more_results_available: boolean
    state: string
}

export interface Mixed {
    type: string
    main: Main[]
    top: any[]
    side: any[]
}

export interface Main {
    type: string
    index?: number
    all: boolean
}

export interface News {
    type: string
    results: Result[]
    mutated_by_goggles: boolean
}

export interface Result {
    title: string
    url: string
    is_source_local: boolean
    is_source_both: boolean
    description: string
    page_age: string
    profile: Profile
    family_friendly: boolean
    meta_url: MetaUrl
    breaking: boolean
    is_live: boolean
    thumbnail: Thumbnail
    age: string
}

export interface Profile {
    name: string
    url: string
    long_name: string
    img: string
}

export interface MetaUrl {
    scheme: string
    netloc: string
    hostname: string
    favicon: string
    path: string
}

export interface Thumbnail {
    src: string
    original: string
}

export interface Videos {
    type: string
    results: Result2[]
    mutated_by_goggles: boolean
}

export interface Result2 {
    type: string
    url: string
    title: string
    description: string
    age: string
    page_age: string
    video: Video
    meta_url: MetaUrl2
    thumbnail: Thumbnail2
}

export interface Video {
    duration: string
    creator: string
    publisher: string
    views?: number
}

export interface MetaUrl2 {
    scheme: string
    netloc: string
    hostname: string
    favicon: string
    path: string
}

export interface Thumbnail2 {
    src: string
    original: string
}

export interface Web {
    type: string
    results: Result3[]
    family_friendly: boolean
}

export interface Result3 {
    title: string
    url: string
    is_source_local: boolean
    is_source_both: boolean
    description: string
    page_age?: string
    profile?: Profile2
    language: string
    family_friendly: boolean
    type: string
    subtype: string
    is_live: boolean
    meta_url: MetaUrl3
    age?: string
    thumbnail?: Thumbnail3
}

export interface Profile2 {
    name: string
    url: string
    long_name: string
    img: string
}

export interface MetaUrl3 {
    scheme: string
    netloc: string
    hostname: string
    favicon: string
    path: string
}

export interface Thumbnail3 {
    src: string
    original: string
    logo: boolean
}
