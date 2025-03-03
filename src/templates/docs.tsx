import React from 'react';
import { graphql } from 'gatsby';
import WrapperLayout from '../components/layout';
import MainContent from '../components/Content/MainContent';

interface IMarkDownFields {
  path: string;
  slug: string;
  modifiedTime: number;
  source: string;
}
export interface IFrontmatterData extends IMarkDownFields {
  title: string;
  time: string;
  toc: string | boolean;
  order: number;
  type: string;
  filename: string;
  subtitle: string;
  path: string;
  disabled: boolean;
  important: boolean;
  next: {
    frontmatter: IGraphqlFrontmatterData;
    fields: IMarkDownFields;
  };
  previous: { frontmatter: IGraphqlFrontmatterData; fields: IMarkDownFields };
  group?: string;
}

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface IGraphqlFrontmatterData extends Omit<IFrontmatterData, 'title'> {
  title: string;
}

export interface IMarkdownRemarkData {
  html: string;
  htmlAst: any;
  tableOfContents: string;
  frontmatter: IGraphqlFrontmatterData;
  fields: IMarkDownFields;
}

export interface IAllMarkdownRemarkData {
  edges: {
    node: {
      frontmatter: IGraphqlFrontmatterData;
      fields: IMarkDownFields;
    };
    next: {
      frontmatter: IGraphqlFrontmatterData;
      fields: IMarkDownFields;
    };
    previous: { frontmatter: IGraphqlFrontmatterData; fields: IMarkDownFields };
  }[];
}

export default function Template({
  data,
  ...rest
}: {
  data: { markdownRemark: IMarkdownRemarkData; allMarkdownRemark: IAllMarkdownRemarkData };
  isMobile: boolean;
  location: {
    pathname: string;
  };
}) {
  const { markdownRemark, allMarkdownRemark } = data;
  const { frontmatter, fields, html, htmlAst, tableOfContents } = markdownRemark;
  const { edges } = allMarkdownRemark;
  const { type } = rest.pageContext;

  const menuList: any[] = [];

  edges.forEach(({ node, next, previous }) => {
    const { fields: nodeFields } = node;

    if (nodeFields.slug.indexOf(type) > -1) {
      menuList.push({
        slug: nodeFields.slug,
        meta: {
          ...node.frontmatter,
          slug: nodeFields.slug,
          filename: nodeFields.slug,
        },
        ...node.frontmatter,
        filename: nodeFields.path,
        next,
        previous,
      });
    }
  });
  return (
    // Only show version selector in docs page
    <WrapperLayout {...rest} showVersion={type==='/docs/'}>
      <MainContent
        {...rest}
        localizedPageData={{
          meta: {
            ...frontmatter,
            ...fields,
            filename: fields.slug,
            path: fields.path,
          },
          toc: tableOfContents,
          content: html,
          htmlAst
        }}
        menuList={menuList}
      />
    </WrapperLayout>
  );
}

export const pageQuery = graphql`
  query TemplateDocsMarkdown($slug: String!, $type: String!, $locale: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      htmlAst
      tableOfContents
      frontmatter {
        title
        order
        type
      }
      fields {
        path
        slug
        modifiedTime
        source
      }
    }
    allMarkdownRemark(
      filter: { fileAbsolutePath: { regex: $type }, fields: { slug: { regex: $locale } } }
      sort: { fields: [frontmatter___order, frontmatter___type ], order: DESC }
    ) {
      edges {
        node {
          frontmatter {
            title
            order
            type
            group
          }
          fields {
            slug
            path
          }
        }
      }
    }
  }
`;
