<?php

namespace Tests\Feature;

use App\Models\Program;
use App\Models\University;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProgramSlugTest extends TestCase
{
    use RefreshDatabase;

    public function test_program_slug_can_be_reused_across_different_universities(): void
    {
        $tu = University::create([
            'name' => 'Tribhuvan University',
            'slug' => 'tribhuvan-university',
            'code' => 'TU',
            'location' => 'Kathmandu',
            'is_active' => true,
        ]);

        $ku = University::create([
            'name' => 'Kathmandu University',
            'slug' => 'kathmandu-university',
            'code' => 'KU',
            'location' => 'Dhulikhel',
            'is_active' => true,
        ]);

        Program::create([
            'university_id' => $tu->id,
            'name' => 'B.Pharm',
            'slug' => 'b-pharm',
            'code' => 'BPH',
            'level' => 'Bachelor',
            'duration_years' => 4,
            'is_active' => true,
        ]);

        $program = Program::create([
            'university_id' => $ku->id,
            'name' => 'B.Pharm',
            'slug' => 'b-pharm',
            'code' => 'BPH-KU',
            'level' => 'Bachelor',
            'duration_years' => 4,
            'is_active' => true,
        ]);

        $this->assertNotNull($program->id);
        $this->assertSame('b-pharm', $program->slug);
    }

    public function test_program_slug_must_still_be_unique_within_the_same_university(): void
    {
        $university = University::create([
            'name' => 'Tribhuvan University',
            'slug' => 'tribhuvan-university',
            'code' => 'TU',
            'location' => 'Kathmandu',
            'is_active' => true,
        ]);

        Program::create([
            'university_id' => $university->id,
            'name' => 'B.Pharm',
            'slug' => 'b-pharm',
            'code' => 'BPH',
            'level' => 'Bachelor',
            'duration_years' => 4,
            'is_active' => true,
        ]);

        $this->expectException(\Illuminate\Database\QueryException::class);

        Program::create([
            'university_id' => $university->id,
            'name' => 'B-Pharm',
            'slug' => 'b-pharm',
            'code' => 'BPH-2',
            'level' => 'Bachelor',
            'duration_years' => 4,
            'is_active' => true,
        ]);
    }
}
