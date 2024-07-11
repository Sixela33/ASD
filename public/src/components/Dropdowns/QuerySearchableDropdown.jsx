import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { HiChevronDown } from "react-icons/hi";

  /*
    options         : Array of items to show in the dropdown 
    label           : The name of the atribute to be seen/searched
    selectedVal     : the selected value
    handleChange    : Function that recieves the selected option
    placeholderText : Text to show when no item is selected
    InViewRef       : A ref in case the data gets called as its needed
  */

const QuerySearchableDropdown = ({ options, label, selectedVal, handleChange, placeholderText, InViewRef, query, setQuery}) => {
  if(!selectedVal) selectedVal = ''
  if(!handleChange) handleChange = () => {}
  if(!placeholderText) placeholderText = ''

  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);
  const searchRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
          setQuery("")
          setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (searchRef.current) {
        searchRef.current.focus();
      }}
  }, [isOpen]);



  const selectOption = (option) => {
    
    setIsOpen(false)
    setQuery("");
    if(option) {
      handleChange(option);
    }
  };


  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full z-20">
      <div ref={inputRef}>
        <div className="relative">
          <div className="selected-value relative">
            <input placeholder={placeholderText} type="text" value={selectedVal[label] || ""} onClick={() => setIsOpen((actual) => !actual)} className="w-full cursor-pointer" readOnly/>
          </div>
          <div className={`arrow absolute right-2 top-1/2 transform -translate-y-1/2 ${isOpen ? "rotate-180" : ""}`}>
            <HiChevronDown />
          </div>
        </div>
        <div className={`options absolute bg-white overflow-y-auto max-h-48 w-full ${isOpen ? "block" : "hidden"}`}>
          {isOpen && (
            <>
            <div className="flex items-center">
                <input ref={searchRef} type="text" value={query || ""} className="w-full border border-gray-300 p-1 mr-2 my-2" placeholder="Search" onChange={handleInputChange} />
                <div className="absolute right-3 text-gray-400">
                    <FiSearch />
                </div>
    
            </div>
            <div className="z-20 ">

              <div className={`option cursor-pointer w-full text-left px-2 py-1 ${null === selectedVal ? "bg-gray-200" : ""}`} onClick={() => selectOption({label: ''})} >
                Clear selection
              </div>
              {options.map((option, index) => (
                <div value={option} key={index} className={`z-20 option cursor-pointer w-full text-left px-2 py-1`} onClick={() => selectOption(option)} >
                  {option[label]}
                </div>
              ))}
              <div ref={InViewRef}><></></div>
            </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuerySearchableDropdown;
