import { http, HttpResponse } from "msw";

const API_BASE_URL = "https://fe-hometask-api.qa.vault.tryvault.com";

// Valid corporation numbers for testing
const VALID_CORPORATION_NUMBERS = [
  "826417395",
  "158739264",
  "123456789",
  "591863427",
  "312574689",
  "287965143",
  "265398741",
  "762354918",
  "468721395",
  "624719583",
];

export const handlers = [
  // GET /corporation-number/:number
  http.get(`${API_BASE_URL}/corporation-number/:number`, ({ params }) => {
    const { number } = params;

    if (VALID_CORPORATION_NUMBERS.includes(number as string)) {
      return HttpResponse.json({
        valid: true,
        corporationNumber: number,
      });
    }

    return HttpResponse.json(
      {
        valid: false,
        message: "Invalid corporation number",
      },
      { status: 200 } // API returns 200 even for invalid numbers
    );
  }),

  // POST /profile-details
  http.post(`${API_BASE_URL}/profile-details`, async ({ request }) => {
    const body = (await request.json()) as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      corporationNumber?: string;
    };

    // Validate required fields
    if (
      !body.firstName ||
      !body.lastName ||
      !body.phone ||
      !body.corporationNumber
    ) {
      return HttpResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate phone format (basic check)
    if (!body.phone.startsWith("+1") || body.phone.length !== 12) {
      return HttpResponse.json(
        { message: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Validate corporation number
    if (!VALID_CORPORATION_NUMBERS.includes(body.corporationNumber)) {
      return HttpResponse.json(
        { message: "Invalid corporation number" },
        { status: 400 }
      );
    }

    // Success
    return HttpResponse.json({}, { status: 200 });
  }),
];
