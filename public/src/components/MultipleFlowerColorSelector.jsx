    import React, { useEffect, useState } from 'react';
    import SearchableDropdown from './Dropdowns/SearchableDropdown';

    export default function MultipleFlowerColorSelector({ options, selectedColors, setSelectedColors, isListBelow }) {
    const [colorList, setColorList] = useState([]);

    useEffect(() => {
        setColorList(options);
    }, [options]);

    const handleColorSelect = (color) => {

        if (color.label == '') {
            setSelectedColors([])
            setColorList(options)
            return
        }

        if (!selectedColors.find((selected) => selected.colorname == color.colorname)) {
        setSelectedColors([...selectedColors, color]);
        setColorList(colorList.filter((item) => item.colorname != color.colorname));
        } else {
        console.warn(`Color '${color.colorname}' already selected.`);
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
                label={'colorname'}
                handleChange={handleColorSelect}
                selectedVal={{ flowerColor: '' }}
                placeholderText={'Add a color'}
            />
            <div className={`grid overflow-y-auto h-20 w-40 ${isListBelow ? '' : 'flex-col gap-1'}`}>
                {selectedColors.map((item) => (
                <div onClick={() => handleRemoveColor(item)} key={item.colorname} className="bg-gray-300 rounded-md m-2 px-2 py-1 flex items-center max-h-5 space-x-2">
                    <p className="text-sm font-medium">{item.colorname}</p>
                    <button className="text-xs hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">X</button>
                </div>
                ))}
            </div>
        </div>
    );
    }
