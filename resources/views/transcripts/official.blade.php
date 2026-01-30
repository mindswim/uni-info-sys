<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Official Transcript</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 3px double #1a365d; padding-bottom: 15px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; color: #1a365d; margin: 0; }
        .header h2 { font-size: 14px; color: #2d3748; margin: 5px 0 0; }
        .header .subtitle { font-size: 11px; color: #718096; margin-top: 3px; }
        .student-info { display: flex; margin-bottom: 20px; }
        .student-info table { width: 100%; }
        .student-info td { padding: 2px 10px 2px 0; }
        .student-info .label { font-weight: bold; color: #4a5568; width: 140px; }
        .term-section { margin-bottom: 15px; page-break-inside: avoid; }
        .term-header { background: #edf2f7; padding: 6px 10px; font-weight: bold; font-size: 11px; color: #2d3748; border-left: 3px solid #1a365d; }
        table.courses { width: 100%; border-collapse: collapse; margin-top: 5px; }
        table.courses th { background: #f7fafc; padding: 4px 8px; text-align: left; font-size: 9px; text-transform: uppercase; color: #718096; border-bottom: 1px solid #e2e8f0; }
        table.courses td { padding: 4px 8px; border-bottom: 1px solid #f0f0f0; }
        .term-summary { text-align: right; padding: 5px 8px; font-size: 9px; color: #4a5568; border-top: 1px solid #cbd5e0; }
        .term-summary strong { color: #2d3748; }
        .cumulative { margin-top: 20px; padding: 10px; background: #f7fafc; border: 1px solid #e2e8f0; }
        .cumulative h3 { margin: 0 0 8px; font-size: 12px; color: #1a365d; }
        .cumulative table { width: 50%; }
        .cumulative td { padding: 3px 0; }
        .cumulative .label { font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 8px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 60px; color: rgba(0,0,0,0.03); font-weight: bold; }
    </style>
</head>
<body>
    <div class="watermark">OFFICIAL TRANSCRIPT</div>

    <div class="header">
        <h1>University Admissions System</h1>
        <h2>Official Academic Transcript</h2>
        <div class="subtitle">This is an official document issued by the Office of the Registrar</div>
    </div>

    <table class="student-info" style="width: 100%;">
        <tr>
            <td class="label">Student Name:</td>
            <td>{{ $student['name'] }}</td>
            <td class="label">Student ID:</td>
            <td>{{ $student['student_number'] }}</td>
        </tr>
        <tr>
            <td class="label">Program:</td>
            <td>{{ $student['program'] }}</td>
            <td class="label">Department:</td>
            <td>{{ $student['department'] }}</td>
        </tr>
        <tr>
            <td class="label">Admission Date:</td>
            <td>{{ $student['admission_date'] ?? 'N/A' }}</td>
            <td class="label">Class Standing:</td>
            <td>{{ ucfirst($student['class_standing'] ?? 'N/A') }}</td>
        </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;">

    @foreach($terms as $term)
    <div class="term-section">
        <div class="term-header">{{ $term['name'] }}</div>
        <table class="courses">
            <thead>
                <tr>
                    <th style="width: 15%;">Code</th>
                    <th style="width: 45%;">Course Title</th>
                    <th style="width: 10%; text-align: center;">Credits</th>
                    <th style="width: 10%; text-align: center;">Grade</th>
                    <th style="width: 20%; text-align: center;">Quality Points</th>
                </tr>
            </thead>
            <tbody>
                @foreach($term['courses'] as $course)
                <tr>
                    <td>{{ $course['code'] }}</td>
                    <td>{{ $course['title'] }}</td>
                    <td style="text-align: center;">{{ $course['credits'] }}</td>
                    <td style="text-align: center;">{{ $course['grade'] }}</td>
                    <td style="text-align: center;">{{ number_format($course['points'], 2) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        <div class="term-summary">
            Term Credits: <strong>{{ $term['term_credits'] }}</strong> &nbsp;|&nbsp;
            Term GPA: <strong>{{ number_format($term['term_gpa'], 2) }}</strong> &nbsp;|&nbsp;
            Cumulative Credits: <strong>{{ $term['cumulative_credits'] }}</strong> &nbsp;|&nbsp;
            Cumulative GPA: <strong>{{ number_format($term['cumulative_gpa'], 2) }}</strong>
        </div>
    </div>
    @endforeach

    <div class="cumulative">
        <h3>Academic Summary</h3>
        <table>
            <tr>
                <td class="label">Total Credits Earned:</td>
                <td>{{ $total_credits }}</td>
            </tr>
            <tr>
                <td class="label">Cumulative GPA:</td>
                <td>{{ number_format($cumulative_gpa, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <p>Issued on {{ $issue_date }} | This transcript is official only when bearing the university seal and registrar signature.</p>
        <p>University Admissions System - Office of the Registrar</p>
    </div>
</body>
</html>
