"use client";

import {
  Building2,
  Check,
  ChevronDown,
  Landmark,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDemoState } from "@/lib/demo-state";
import {
  isCollegeDeliveryUnit,
  isDirectDeliveryUnit,
  unitTypeLabels,
} from "@/lib/institution-structure";

export function AcademicDeliveryUnitSelector({
  universityId,
  value,
  onChange,
  label = "Academic delivery unit",
  disabled = false,
}: {
  universityId: string;
  value: string | null;
  onChange: (deliveryUnitId: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const { academicDeliveryUnits } = useDemoState();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const units = useMemo(
    () =>
      academicDeliveryUnits
        .filter((unit) => unit.universityId === universityId && unit.active)
        .filter((unit) =>
          `${unit.name} ${unit.shortName} ${unit.institutionCode} ${unit.district}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
    [academicDeliveryUnits, query, universityId],
  );
  const directUnits = units.filter(isDirectDeliveryUnit);
  const colleges = units.filter(isCollegeDeliveryUnit);
  const selected =
    academicDeliveryUnits.find((unit) => unit.id === value) ?? null;

  function choose(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="delivery-unit-selector">
      <label>{label}</label>
      <button
        type="button"
        className="delivery-unit-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        {selected && isCollegeDeliveryUnit(selected) ? (
          <Building2 size={17} aria-hidden="true" />
        ) : (
          <Landmark size={17} aria-hidden="true" />
        )}
        <span>
          <strong>{selected?.name ?? "Select a delivery unit"}</strong>
          <small>
            {selected
              ? `${unitTypeLabels[selected.unitType]} · ${selected.district}`
              : "Direct teaching units and colleges"}
          </small>
        </span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open ? (
        <div className="delivery-unit-popover">
          <label className="delivery-unit-search">
            <Search size={15} aria-hidden="true" />
            <span className="sr-only">Search academic delivery units</span>
            <input
              autoFocus
              value={query}
              placeholder="Search name, code or district"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
              }}
            />
          </label>
          <div className="delivery-unit-options" role="listbox">
            {directUnits.length ? (
              <div className="delivery-unit-group">
                <span>Direct university teaching units</span>
                {directUnits.map((unit) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={unit.id === value}
                    onClick={() => choose(unit.id)}
                    key={unit.id}
                  >
                    <Landmark size={15} aria-hidden="true" />
                    <span>
                      <strong>{unit.name}</strong>
                      <small>
                        {unitTypeLabels[unit.unitType]} · {unit.district}
                      </small>
                    </span>
                    {unit.id === value ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            {colleges.length ? (
              <div className="delivery-unit-group">
                <span>Colleges</span>
                {colleges.map((unit) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={unit.id === value}
                    onClick={() => choose(unit.id)}
                    key={unit.id}
                  >
                    <Building2 size={15} aria-hidden="true" />
                    <span>
                      <strong>{unit.name}</strong>
                      <small>
                        {unitTypeLabels[unit.unitType]} · {unit.district}
                      </small>
                    </span>
                    {unit.id === value ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            ) : null}
            {!units.length ? (
              <div className="delivery-unit-empty">
                No active delivery units match this search.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
