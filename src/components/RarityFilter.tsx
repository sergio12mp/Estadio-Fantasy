// src/components/RarityFilter.tsx
import React from 'react';

interface RarityFilterProps {
    rarezaFiltros: string[];
    handleRarezaChange: (rareza: string) => void;
}

const RARITIES = ['Común', 'Raro', 'Épico', 'Legendario'];

const RarityFilter: React.FC<RarityFilterProps> = ({ rarezaFiltros, handleRarezaChange }) => {
    return (
        <div className="flex flex-col gap-1">
            {RARITIES.map((rareza) => (
                <label key={rareza} className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={rarezaFiltros.includes(rareza)}
                        onChange={() => handleRarezaChange(rareza)}
                        className="form-checkbox text-blue-600"
                    />
                    {rareza}
                </label>
            ))}
        </div>
    );
};

export default RarityFilter;