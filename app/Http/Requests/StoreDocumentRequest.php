<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use OpenApi\Attributes as OA;

#[OA\Schema(
    schema: 'StoreDocumentRequest',
    title: 'Store Document Request',
    required: ['document_type', 'file'],
    properties: [
        new OA\Property(property: 'document_type', type: 'string', enum: ['transcript', 'essay', 'recommendation', 'certificate', 'other'], example: 'transcript'),
        new OA\Property(property: 'file', type: 'string', format: 'binary', description: 'The document file to upload (PDF, DOC, DOCX)'),
    ]
)]
class StoreDocumentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization is handled by the controller policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'document_type' => 'required|string|in:transcript,essay,recommendation,certificate,other',
            'file' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB max
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'file.required' => 'A document file is required.',
            'file.file' => 'The uploaded file is not valid.',
            'file.mimes' => 'The file must be a PDF, DOC, or DOCX document.',
            'file.max' => 'The file size cannot exceed 5MB.',
            'document_type.required' => 'Please specify the type of document.',
            'document_type.in' => 'The document type must be one of: transcript, essay, recommendation, certificate, or other.',
        ];
    }
}
