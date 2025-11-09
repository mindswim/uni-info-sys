<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Jobs\ProcessRoomImport;
use App\Models\Room;
use App\Http\Resources\RoomResource;
use App\Http\Requests\StoreRoomRequest;
use App\Http\Requests\UpdateRoomRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: "Rooms",
    description: "Endpoints for managing rooms within buildings."
)]
class RoomController extends Controller
{
    use HandlesCsvImportExport;
    #[OA\Get(
        path: "/api/v1/rooms",
        summary: "List all rooms",
        tags: ["Rooms"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "building_id", in: "query", required: false, description: "Filter by building ID", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "A paginated list of rooms.",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/RoomResource"))
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
        ]
    )]
    public function index(Request $request)
    {
        $query = Room::with('building');

        if ($request->has('building_id')) {
            $query->where('building_id', $request->building_id);
        }

        return RoomResource::collection($query->paginate(10));
    }

    #[OA\Post(
        path: "/api/v1/rooms",
        summary: "Create a new room",
        tags: ["Rooms"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/StoreRoomRequest")
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Room created successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/RoomResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(StoreRoomRequest $request)
    {
        $room = Room::create($request->validated());
        $room->load('building');
        return new RoomResource($room);
    }

    #[OA\Get(
        path: "/api/v1/rooms/{room}",
        summary: "Get a single room",
        tags: ["Rooms"],
        parameters: [
            new OA\Parameter(name: "room", in: "path", required: true, description: "ID of the room", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "The requested room.",
                content: new OA\JsonContent(ref: "#/components/schemas/RoomResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function show(Room $room)
    {
        $room->load('building');
        return new RoomResource($room);
    }

    /**
     * Update the specified resource in storage.
     */
    #[OA\Put(
        path: "/api/v1/rooms/{room}",
        summary: "Update a room",
        tags: ["Rooms"],
        parameters: [
            new OA\Parameter(name: "room", in: "path", required: true, description: "ID of the room", schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/UpdateRoomRequest")
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Room updated successfully.",
                content: new OA\JsonContent(ref: "#/components/schemas/RoomResource")
            ),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Not Found"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function update(UpdateRoomRequest $request, Room $room)
    {
        $room->update($request->validated());
        $room->load('building');
        return new RoomResource($room);
    }

    #[OA\Delete(
        path: "/api/v1/rooms/{room}",
        summary: "Delete a room",
        tags: ["Rooms"],
        parameters: [
            new OA\Parameter(name: "room", in: "path", required: true, description: "ID of the room", schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 204, description: "Room deleted successfully."),
            new OA\Response(response: 401, description: "Unauthenticated"),
            new OA\Response(response: 404, description: "Not Found"),
        ]
    )]
    public function destroy(Room $room)
    {
        $room->delete();
        return response()->noContent();
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'rooms';
    }

    protected function getImportJobClass(): string
    {
        return ProcessRoomImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return ['room_number', 'building_code', 'capacity', 'room_type'];
    }

    protected function getSampleCsvData(): array
    {
        return ['101', 'SCI', '30', 'Classroom'];
    }

    protected function getExportData(Request $request): Collection
    {
        return Room::with('building')->get();
    }

    protected function transformToRow($room): array
    {
        return [
            $room->room_number,
            $room->building?->code ?? '',
            $room->capacity,
            $room->room_type ?? 'Classroom',
        ];
    }
}
