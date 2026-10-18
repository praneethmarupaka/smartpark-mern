# SmartPark Directory Data & Import Specification

This folder contains CSV templates and sample data for the Hyderabad parking facility directory.

## Fields Specification

| Column Header | Required | Valid Values / Types | Description |
|---|---|---|---|
| `name` | Yes | String (2-200 chars) | Official or recognized name of the facility |
| `category` | No (default: PUBLIC) | `PUBLIC`, `PRIVATE`, `COMMERCIAL`, `GOVERNMENT`, `GHMC`, `TRANSPORT`, `OTHER` | Facility classification |
| `facilityType` | No | E.g. 'Metro station parking', 'GHMC parking grounds', 'Shopping mall parking' | Facility operational style |
| `address` | Yes | String | Street and door address |
| `locality` | Yes | String | Locality/Neighborhood (e.g., Madhapur, Abids) |
| `city` | No (default: Hyderabad) | String | City name |
| `state` | No (default: Telangana) | String | State |
| `latitude` | Recommended | Decimal between -90 and 90 (e.g. 17.4475) | WGS-84 latitude |
| `longitude` | Recommended | Decimal between -180 and 180 (e.g. 78.3762) | WGS-84 longitude |
| `supportedVehicleTypes` | No | Comma-separated: `TWO_WHEELER`, `FOUR_WHEELER`, `HEAVY_VEHICLE` | Types allowed |
| `publicAccess` | No | `PUBLIC`, `CUSTOMERS_ONLY`, `STAFF_ONLY`, `PERMIT_REQUIRED`, `RESTRICTED`, `UNKNOWN` | Access permissions |
| `pricingModel` | No | `FREE`, `PAID`, `VARIABLE`, `UNKNOWN` | Tariff model |
| `twoWheelerHourlyRate`| No | Number in INR | Hourly rate |
| `fourWheelerHourlyRate`| No | Number in INR | Hourly rate |
| `twoWheelerCapacity` | No | Positive integer | Total bike spaces |
| `fourWheelerCapacity`| No | Positive integer | Total car spaces |
| `bookingSupported` | No | `true`, `false` | Whether advance booking is supported |
| `sourceReference` | No | String | Official gazette, survey number or ticket id |

> [!IMPORTANT]
> All newly imported records will default to `UNVERIFIED` status. Administrators must inspect and review evidence before marking records as `VERIFIED`.
