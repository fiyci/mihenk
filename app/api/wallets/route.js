import { makeCrud } from "../../../lib/crud";
export const dynamic = "force-dynamic";
const crud = makeCrud("wallets");
export const GET = crud.GET;
export const POST = crud.POST;
export const PUT = crud.PUT;
export const DELETE = crud.DELETE;
