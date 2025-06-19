<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProgramRequest;
use App\Http\Requests\UpdateProgramRequest;
use App\Models\Program;
use Illuminate\Http\Request;
use App\Http\Resources\ProgramResource;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Programs',
    description: 'Endpoints for managing academic programs.'
)]
class ProgramController extends Controller
{
    #[OA\Get(
        path: '/api/v1/programs',
        summary: 'List all programs',
        tags: ['Programs'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'A paginated list of programs.',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/ProgramResource')
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
        ]
    )]
    public function index(Request $request)
    {
        $query = Program::with('department');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        return ProgramResource::collection($query->paginate(10));
    }

    #[OA\Post(
        path: '/api/v1/programs',
        summary: 'Create a new program',
        tags: ['Programs'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreProgramRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Program created successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/ProgramResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreProgramRequest $request)
    {
        $validated = $request->validated();

        $program = Program::create($validated);

        return new ProgramResource($program);
    }

    #[OA\Get(
        path: '/api/v1/programs/{program}',
        summary: 'Get a single program',
        tags: ['Programs'],
        parameters: [
            new OA\Parameter(
                name: 'program',
                in: 'path',
                required: true,
                description: 'ID of the program',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'The requested program.',
                content: new OA\JsonContent(ref: '#/components/schemas/ProgramResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function show(Program $program)
    {
        return new ProgramResource($program->load('department'));
    }

    #[OA\Put(
        path: '/api/v1/programs/{program}',
        summary: 'Update a program',
        tags: ['Programs'],
        parameters: [
            new OA\Parameter(
                name: 'program',
                in: 'path',
                required: true,
                description: 'ID of the program',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateProgramRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Program updated successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/ProgramResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateProgramRequest $request, Program $program)
    {
        $validated = $request->validated();

        $program->update($validated);

        return new ProgramResource($program);
    }

    #[OA\Delete(
        path: '/api/v1/programs/{program}',
        summary: 'Delete a program',
        tags: ['Programs'],
        parameters: [
            new OA\Parameter(
                name: 'program',
                in: 'path',
                required: true,
                description: 'ID of the program',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Program deleted successfully.'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function destroy(Program $program)
    {
        $program->delete();

        return response()->noContent();
    }
}
