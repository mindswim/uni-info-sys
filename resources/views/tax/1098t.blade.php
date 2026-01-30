<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; font-size: 9pt; margin: 0.5in; color: #333; }
        .form-header { text-align: center; margin-bottom: 20px; }
        .form-header h1 { font-size: 14pt; margin: 0; }
        .form-header h2 { font-size: 11pt; margin: 5px 0; color: #666; }
        .info-grid { display: table; width: 100%; margin-bottom: 20px; }
        .info-row { display: table-row; }
        .info-cell { display: table-cell; padding: 8px; border: 1px solid #999; width: 50%; vertical-align: top; }
        .info-cell label { font-weight: bold; font-size: 8pt; color: #666; display: block; margin-bottom: 4px; }
        .info-cell .value { font-size: 10pt; }
        .boxes { width: 100%; border-collapse: collapse; margin-top: 15px; }
        .boxes th { background: #e0e0e0; text-align: left; padding: 6px; border: 1px solid #999; font-size: 8pt; }
        .boxes td { padding: 6px; border: 1px solid #999; }
        .boxes td.amount { text-align: right; font-weight: bold; }
        .notice { margin-top: 20px; font-size: 7pt; color: #666; border-top: 1px solid #ccc; padding-top: 10px; }
        .tax-year { font-size: 16pt; font-weight: bold; color: #1a365d; }
    </style>
</head>
<body>
    <div class="form-header">
        <h1>Form 1098-T</h1>
        <h2>Tuition Statement</h2>
        <div class="tax-year">Tax Year {{ $form->tax_year }}</div>
    </div>

    <div class="info-grid">
        <div class="info-row">
            <div class="info-cell">
                <label>FILER'S name, address, and telephone no.</label>
                <div class="value">
                    {{ $form->institution_name }}<br>
                    {{ $form->institution_address }}<br>
                    EIN: {{ $form->institution_ein }}
                </div>
            </div>
            <div class="info-cell">
                <label>STUDENT'S name and address</label>
                <div class="value">
                    {{ $form->student->user->name ?? 'N/A' }}<br>
                    Student ID: {{ $form->student->student_id ?? $form->student->id }}
                    @if($form->student_ssn_last4)
                    <br>SSN: XXX-XX-{{ $form->student_ssn_last4 }}
                    @endif
                </div>
            </div>
        </div>
    </div>

    <table class="boxes">
        <tr>
            <th>Box</th>
            <th>Description</th>
            <th>Amount</th>
        </tr>
        <tr>
            <td>1</td>
            <td>Payments received for qualified tuition and related expenses</td>
            <td class="amount">${{ number_format($form->qualified_tuition, 2) }}</td>
        </tr>
        <tr>
            <td>5</td>
            <td>Scholarships or grants</td>
            <td class="amount">${{ number_format($form->scholarships_grants, 2) }}</td>
        </tr>
        <tr>
            <td>6</td>
            <td>Adjustments to scholarships or grants for a prior year</td>
            <td class="amount">${{ number_format($form->adjustments, 2) }}</td>
        </tr>
    </table>

    <p><strong>Status:</strong> {{ ucfirst($form->status) }}</p>
    <p><strong>Generated:</strong> {{ $form->generated_at?->format('F j, Y') }}</p>

    <div class="notice">
        <p><strong>Important Tax Notice:</strong> This is important tax information and is being furnished to the
        Internal Revenue Service. If you are required to file a return, a negligence penalty or other sanction may
        be imposed on you if this income is taxable and the IRS determines that it has not been reported.</p>
        <p>This form is provided for informational purposes. Consult a tax advisor regarding your specific tax situation.</p>
    </div>
</body>
</html>
