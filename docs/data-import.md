# SmartPark — Directory Data Sourcing & CSV/GeoJSON Import Pipeline

## 1. Traceable Hyderabad Data Sources

SmartPark parking records are indexed from legitimate, verifiable public and transit bodies:
- **Hyderabad Metro Rail (HMR)**: Multimodal parking facilities at terminal and interchange stations (Miyapur, Hitec City, Ameerpet, L.B. Nagar).
- **South Central Railway (SCR)**: Major junction multilevel car parks (Secunderabad, Nampally, Kacheguda).
- **Greater Hyderabad Municipal Corporation (GHMC)**: Modern automated multi-level parking grounds (Abids, Gunfoundry, heritage zones).
- **Hyderabad Traffic Police Directories**: Officially authorized street parking and event lots.
- **Commercial & Retail Operators**: Verified mall basements (Inorbit, Forum Sujana, City Centre).

---

## 2. CSV Specification

Imports must follow the schema defined in `sample-data/parking-template.csv`:

```csv
name,category,facilityType,address,locality,city,state,postalCode,latitude,longitude,supportedVehicleTypes,publicAccess,pricingModel,twoWheelerHourlyRate,fourWheelerHourlyRate,dailyPassRate,twoWheelerCapacity,fourWheelerCapacity,is24x7,opensAt,closesAt,bookingSupported,sourceReference
```

### Critical Ingestion Rules:
1. **Default Verification Status**: All newly imported records are marked `UNVERIFIED`. They never receive a `VERIFIED` badge until an administrator conducts an inspection.
2. **Duplicate Detection**: The ingestion pipeline normalizes facility names and localities. Any match against an existing record is flagged as a potential duplicate and skipped from re-creation.
3. **Preservation of Administrator Corrections**: Later batch imports will not silently overwrite manual field corrections made by administrators.
4. **Coordinate Validation**: Records with missing or out-of-range coordinates are stored with `hasCoordinates: false` and are excluded from accurate map positioning until verified.
