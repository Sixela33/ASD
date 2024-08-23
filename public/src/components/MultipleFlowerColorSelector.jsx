import React, { useEffect, useState } from 'react';
import SearchableDropdown from './Dropdowns/SearchableDropdown';

export default function MultipleFlowerColorSelector({ options, selectedColors, setSelectedColors, isListBelow, doubleColunms, label, placeholderText }) {
    if(!label) label = 'colorname'  

    const [colorList, setColorList] = useState([]);

    useEffect(() => {
      setColorList(options);

      selectedColors?.map(color => {
        setColorList(list => list.filter((item) => item?.[label] != color?.[label]));
      })
    }, [options, selectedColors]);

    const handleColorSelect = (color) => {

      if (color.label == '') {
          setSelectedColors([])
          setColorList(options)
          return
      }

      if (!selectedColors?.find((selected) => selected?.[label] == color?.[label])) {
        setSelectedColors([...selectedColors, color]);
      } else {
        console.warn(`${color?.[label]}' already selected.`);
      }
    };

    const handleRemoveColor = (color) => {
      setSelectedColors(selectedColors.filter((selected) => selected !== color));
      setColorList([...colorList, color])
    };



    return (
      <div className={`flex items-center ${isListBelow ? 'flex-col' : 'flex-row'}`}>
        <SearchableDropdown
          options={colorList}
          label={label}
          handleChange={handleColorSelect}
          selectedVal={{ flowerColor: '' }}
          placeholderText={placeholderText}
        />
        <div className={`overflow-y-auto h-20 w-full mt-4 grid grid-cols-1 m-2 ${doubleColunms && 'lg:grid-cols-2'}`}>
          {selectedColors && selectedColors.map((item) => (
            <div onClick={() => handleRemoveColor(item)} key={item?.[label]} className={`${isListBelow ? 'bg-gray-500': 'bg-white'} h-7 rounded-md m-2 px-2 py-1 flex items-center justify-between hover:cursor-pointer`}>
              <p className="text-sm font-medium">{item?.[label]}</p>
              <button className="text-xs hover:text-red-700 ml-auto">X</button>
            </div>
          ))}
        </div>
      </div>
    );
    }
