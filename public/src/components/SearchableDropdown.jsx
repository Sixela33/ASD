import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";
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
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e) => {
    if (inputRef.current && !inputRef.current.contains(e.target)) {
        setQuery("")
        setIsOpen(false);
    }
  };


  const handleInputChange = (e) => {
    e.preventDefault();
    setQuery(e.target.value);
    setIsOpen(true);
  };

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
