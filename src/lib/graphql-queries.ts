import { gql } from '@apollo/client'

// Query for blog posts with essential fields only
export const GET_POSTS = gql`
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        databaseId
        title
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        author {
          node {
            id
            name
            slug
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        tags {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`

// Query for a single post with full content
export const GET_POST_BY_SLUG = gql`
  query GetPostBySlug($slug: String!) {
    post(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      excerpt
      slug
      date
      modified
      featuredImage {
        node {
          id
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      author {
        node {
          id
          name
          slug
          avatar {
            url
          }
        }
      }
      categories {
        nodes {
          id
          name
          slug
        }
      }
      tags {
        nodes {
          id
          name
          slug
        }
      }
      seo {
        title
        metaDesc
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`

// Query for pages
export const GET_PAGES = gql`
  query GetPages($first: Int = 10, $after: String) {
    pages(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        databaseId
        title
        content
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        seo {
          title
          metaDesc
          opengraphTitle
          opengraphDescription
          opengraphImage {
            sourceUrl
          }
        }
      }
    }
  }
`

// Query for a single page
export const GET_PAGE_BY_SLUG = gql`
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: URI) {
      id
      databaseId
      title
      content
      excerpt
      slug
      date
      modified
      featuredImage {
        node {
          id
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      seo {
        title
        metaDesc
        opengraphTitle
        opengraphDescription
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`

// Query for categories
export const GET_CATEGORIES = gql`
  query GetCategories($first: Int = 100) {
    categories(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
      }
    }
  }
`

// Query for tags
export const GET_TAGS = gql`
  query GetTags($first: Int = 100) {
    tags(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
      }
    }
  }
`

// Query for posts by category
export const GET_POSTS_BY_CATEGORY = gql`
  query GetPostsByCategory($categorySlug: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: { categoryName: $categorySlug, status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        databaseId
        title
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        author {
          node {
            id
            name
            slug
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`

// Search query for posts
export const SEARCH_POSTS = gql`
  query SearchPosts($search: String!, $first: Int = 10, $after: String) {
    posts(
      first: $first
      after: $after
      where: { search: $search, status: PUBLISH }
    ) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      nodes {
        id
        databaseId
        title
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        author {
          node {
            id
            name
            slug
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`

// Query for related posts based on categories and tags
export const GET_RELATED_POSTS = gql`
  query GetRelatedPosts($postId: ID!, $categoryIds: [ID!], $tagIds: [ID!], $first: Int = 3) {
    posts(
      first: $first
      where: { 
        status: PUBLISH,
        notIn: [$postId],
        categoryIn: $categoryIds,
        tagIn: $tagIds
      }
    ) {
      nodes {
        id
        databaseId
        title
        excerpt
        slug
        date
        modified
        featuredImage {
          node {
            id
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        author {
          node {
            id
            name
            slug
          }
        }
        categories {
          nodes {
            id
            name
            slug
          }
        }
        tags {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`
