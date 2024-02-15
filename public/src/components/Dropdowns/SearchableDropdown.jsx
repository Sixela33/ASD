import { useEffect, useRef, useState } from "react";
import QuerySearchableDropdown from "./QuerySearchableDropdown";

  /*
    options         : Array of items to show in the dropdown 
    label           : The name of the atribute to be seen/searched
    selectedVal     : the selected value
    handleChange    : Function that recieves the selected option
    placeholderText : Text to show when no item is selected
  */

const SearchableDropdown = ({ options, label, selectedVal, handleChange, placeholderText }) => {
  const [query, setQuery] = useState("");

  const filterOptions = () => {
    return options.filter(option =>
      option[label].toLowerCase().includes(query.toLowerCase())
    );
  };

  return (
      <QuerySearchableDropdown
      options={filterOptions()}
      label={label}
      selectedVal={selectedVal}
      handleChange={handleChange}
      placeholderText={placeholderText}
      InViewRef={() => {}}
      query={query}
      setQuery ={setQuery}
      />
  );
};

export default SearchableDropdown;
