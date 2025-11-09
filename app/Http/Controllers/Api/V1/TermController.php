<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\HandlesCsvImportExport;
use App\Jobs\ProcessTermImport;
use App\Models\Term;
use App\Http\Resources\TermResource;
use App\Http\Requests\StoreTermRequest;
use App\Http\Requests\UpdateTermRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Terms',
    description: 'Endpoints for managing academic terms and semesters.'
)]
class TermController extends Controller
{
    use HandlesCsvImportExport;
    #[OA\Get(
        path: '/api/v1/terms',
        summary: 'List all terms',
        tags: ['Terms'],
        parameters: [
            new OA\Parameter(
                name: 'academic_year',
                in: 'query',
                required: false,
                description: 'Filter terms by academic year',
                schema: new OA\Schema(type: 'integer', minimum: 2000)
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'A paginated list of terms.',
                content: new OA\JsonContent(
                    type: 'array',
                    items: new OA\Items(ref: '#/components/schemas/TermResource')
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
        ]
    )]
    public function index(Request $request)
    {
        $this->authorize('viewAny', Term::class);
        
        $query = Term::query();

        if ($request->has('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        return TermResource::collection($query->paginate(10));
    }

    #[OA\Post(
        path: '/api/v1/terms',
        summary: 'Create a new term',
        tags: ['Terms'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/StoreTermRequest')
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Term created successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/TermResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function store(StoreTermRequest $request)
    {
        $this->authorize('create', Term::class);
        
        $term = Term::create($request->validated());
        return new TermResource($term);
    }

    #[OA\Get(
        path: '/api/v1/terms/{term}',
        summary: 'Get a single term',
        tags: ['Terms'],
        parameters: [
            new OA\Parameter(
                name: 'term',
                in: 'path',
                required: true,
                description: 'ID of the term',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'The requested term.',
                content: new OA\JsonContent(ref: '#/components/schemas/TermResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function show(Term $term)
    {
        $this->authorize('view', $term);
        
        return new TermResource($term);
    }

    #[OA\Put(
        path: '/api/v1/terms/{term}',
        summary: 'Update a term',
        tags: ['Terms'],
        parameters: [
            new OA\Parameter(
                name: 'term',
                in: 'path',
                required: true,
                description: 'ID of the term',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(ref: '#/components/schemas/UpdateTermRequest')
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Term updated successfully.',
                content: new OA\JsonContent(ref: '#/components/schemas/TermResource')
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
            new OA\Response(response: 422, description: 'Validation error'),
        ]
    )]
    public function update(UpdateTermRequest $request, Term $term)
    {
        $this->authorize('update', $term);
        
        $term->update($request->validated());
        return new TermResource($term);
    }

    #[OA\Delete(
        path: '/api/v1/terms/{term}',
        summary: 'Delete a term',
        tags: ['Terms'],
        parameters: [
            new OA\Parameter(
                name: 'term',
                in: 'path',
                required: true,
                description: 'ID of the term',
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(response: 204, description: 'Term deleted successfully.'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 403, description: 'Unauthorized'),
            new OA\Response(response: 404, description: 'Not Found'),
        ]
    )]
    public function destroy(Term $term)
    {
        $this->authorize('delete', $term);

        $term->delete();
        return response()->noContent();
    }

    // CSV Import/Export Methods

    protected function getEntityName(): string
    {
        return 'terms';
    }

    protected function getImportJobClass(): string
    {
        return ProcessTermImport::class;
    }

    protected function getCsvHeaders(): array
    {
        return ['name', 'code', 'start_date', 'end_date', 'is_current'];
    }

    protected function getSampleCsvData(): array
    {
        return ['Fall 2024', 'FALL2024', '2024-08-26', '2024-12-20', 'true'];
    }

    protected function getExportData(Request $request): Collection
    {
        return Term::all();
    }

    protected function transformToRow($term): array
    {
        return [
            $term->name,
            $term->code,
            $term->start_date?->format('Y-m-d') ?? '',
            $term->end_date?->format('Y-m-d') ?? '',
            $term->is_current ? 'true' : 'false',
        ];
    }
}
