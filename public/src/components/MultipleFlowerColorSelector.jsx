import React, { useEffect, useState } from 'react';
import SearchableDropdown from './Dropdowns/SearchableDropdown';

export default function MultipleFlowerColorSelector({ options, selectedColors, setSelectedColors, isListBelow, doubleColumns, label, placeholderText, selectAllButton }) {
    if(!label) label = 'colorname'  

    const [colorList, setColorList] = useState([]);

    useEffect(() => {
      let temp = [...options];

      if (selectAllButton) {
        temp = [{ [label]: "All" }, ...temp];
      }

      setColorList(temp.filter(item => 
        !selectedColors?.some(selected => selected[label] === item[label])
      ))
    }, [options, selectedColors, label, selectAllButton]);

    const handleColorSelect = (color) => {
      if (color.label == '') {
        setSelectedColors([])
        setColorList(options)
        return
      }

      if (color[label] === 'All') {
        setSelectedColors(options)
        setColorList([])
        return
      }

      if (!selectedColors?.some(selected => selected[label] === color[label])) {
        setSelectedColors([...selectedColors, color]);
        setColorList(colorList.filter(item => item[label] !== color[label]));
      } else {
        console.warn(`'${color[label]}' already selected.`);
      }
    };

    const handleRemoveColor = (color) => {
      setSelectedColors(selectedColors.filter(selected => selected[label] !== color[label]));
      setColorList([...colorList, color].sort((a, b) => a[label].localeCompare(b[label])))
    };

    return (
      <div className={`flex items-center ${isListBelow ? 'flex-col' : 'flex-row'}`}>
        <SearchableDropdown
          options={colorList}
          label={label}
          handleChange={handleColorSelect}
          selectedVal={{ [label]: '' }}
          placeholderText={placeholderText}
          selectAllButton={true}
        />
        <div className={`overflow-y-auto h-20 w-full mt-4 grid grid-cols-1 m-2 ${doubleColumns && 'lg:grid-cols-2'}`}>
          {selectedColors && selectedColors.map((item) => (
            <div onClick={() => handleRemoveColor(item)} key={item[label]} className={`${isListBelow ? 'bg-gray-500': 'bg-white'} h-7 rounded-md m-2 px-2 py-1 flex items-center justify-between hover:cursor-pointer`}>
              <p className="text-sm font-medium">{item[label]}</p>
              <button className="text-xs hover:text-red-700 ml-auto">X</button>
            </div>
          ))}
        </div>
      </div>
    );
    }
