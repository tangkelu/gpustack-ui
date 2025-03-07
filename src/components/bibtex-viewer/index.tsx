import bibtexParse from '@orcid/bibtex-parse-js';
import { Typography } from 'antd';
import React from 'react';

/*
  @inproceedings{Lysenko:2010:GMC:1839778.1839781,\
  author = {Lysenko, Mikola and Nelaturi, Saigopal and Shapiro, Vadim},\
  title = {Group morphology with convolution algebras},\
  booktitle = {Proceedings of the 14th ACM Symposium on Solid and Physical Modeling},\
  series = {SPM '10},\
  year = {2010},\
  isbn = {978-1-60558-984-8},\
  location = {Haifa, Israel},\
  pages = {11--22},\
  numpages = {12},\
  url = {http://doi.acm.org/10.1145/1839778.1839781},\
  doi = {10.1145/1839778.1839781},\
  acmid = {1839781},\
  publisher = {ACM},\
  address = {New York, NY, USA},\
 }
*/

const BibTeXViewer: React.FC<{ data: string }> = ({ data }) => {
  if (!data) {
    return null;
  }
  const dataList = bibtexParse.toJSON(data);
  return (
    <ol>
      {dataList.map((item: any, index: number) => (
        <li key={index} style={{ lineHeight: 2 }}>
          <Typography.Link href={item.entryTags?.url} target="_blank">
            {item.entryTags?.title}.{' '}
          </Typography.Link>
          <Typography.Text>{item.entryTags?.author}. </Typography.Text>
          <Typography.Text>[{item.entryTags?.year}] </Typography.Text>
          {item.entryTags?.journal && (
            <Typography.Text>.({item.entryTags?.journal})</Typography.Text>
          )}
        </li>
      ))}
    </ol>
  );
};

export default BibTeXViewer;
