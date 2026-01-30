<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 1in; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1a365d; padding-bottom: 20px; }
        .header h1 { color: #1a365d; font-size: 18pt; margin: 0; }
        .header p { margin: 4px 0; font-size: 10pt; color: #666; }
        .title { text-align: center; font-size: 14pt; font-weight: bold; margin: 30px 0; text-transform: uppercase; letter-spacing: 1px; }
        .date { text-align: right; margin-bottom: 20px; }
        .body p { line-height: 1.6; margin-bottom: 12px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #f0f0f0; text-align: left; padding: 8px; border: 1px solid #ccc; font-size: 10pt; }
        td { padding: 8px; border: 1px solid #ccc; font-size: 10pt; }
        .signature { margin-top: 60px; }
        .signature-line { border-top: 1px solid #333; width: 250px; margin-top: 40px; padding-top: 5px; }
        .footer { margin-top: 40px; font-size: 8pt; color: #999; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{ config('app.name', 'University') }}</h1>
        <p>Office of the Registrar</p>
        <p>123 University Avenue, College Town, ST 12345</p>
    </div>

    <div class="title">Enrollment Verification Letter</div>

    <div class="date">{{ $issue_date }}</div>

    <div class="body">
        <p>To Whom It May Concern:</p>

        <p>This letter certifies that <strong>{{ $student->user->name }}</strong>
        (Student ID: {{ $student->student_id ?? $student->id }}) is currently enrolled at
        {{ config('app.name', 'University') }} for the <strong>{{ $term->name }}</strong> term.</p>

        <p><strong>Enrollment Status:</strong> {{ $enrollment_status }}<br>
        <strong>Total Credit Hours:</strong> {{ $total_credits }}</p>

        @if($enrollments->count() > 0)
        <p>The student is enrolled in the following courses:</p>
        <table>
            <thead>
                <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credit Hours</th>
                </tr>
            </thead>
            <tbody>
                @foreach($enrollments as $enrollment)
                <tr>
                    <td>{{ $enrollment->courseSection->course->course_code }}</td>
                    <td>{{ $enrollment->courseSection->course->name }}</td>
                    <td>{{ $enrollment->courseSection->course->credit_hours ?? 'N/A' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        @endif

        <p>This letter is issued upon the student's request and is valid as of the date indicated above.</p>
    </div>

    <div class="signature">
        <div class="signature-line">
            Office of the Registrar<br>
            {{ config('app.name', 'University') }}
        </div>
    </div>

    <div class="footer">
        Verification Code: {{ $verification_code }} | This document can be verified by contacting the Office of the Registrar.
    </div>
</body>
</html>
