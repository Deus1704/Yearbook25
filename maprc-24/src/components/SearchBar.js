import React from 'react';
import { Form, FormControl } from 'react-bootstrap';
import './SearchBar.css';

const SearchBar = () => {
  return (
    <Form className="search-bar">
      <FormControl type="text" placeholder="Search here..." />
    </Form>
  );
};

export default SearchBar;
