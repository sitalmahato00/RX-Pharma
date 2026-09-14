<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasColumn('programs', 'university_id')) {
            if (Schema::hasIndex('programs', 'programs_slug_unique')) {
                Schema::table('programs', function (Blueprint $table) {
                    $table->dropUnique('programs_slug_unique');
                });
            }

            if (! Schema::hasIndex('programs', 'programs_university_id_slug_unique')) {
                Schema::table('programs', function (Blueprint $table) {
                    $table->unique(['university_id', 'slug']);
                });
            }
        }

        $duplicates = DB::table('programs')
            ->select('university_id', 'slug')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('university_id', 'slug')
            ->having('total', '>', 1)
            ->get();

        foreach ($duplicates as $duplicate) {
            $rows = DB::table('programs')
                ->where('university_id', $duplicate->university_id)
                ->where('slug', $duplicate->slug)
                ->orderBy('id')
                ->get();

            foreach ($rows->slice(1) as $row) {
                DB::table('programs')
                    ->where('id', $row->id)
                    ->update([
                        'slug' => $row->slug . '-' . $row->id,
                    ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasIndex('programs', 'programs_university_id_slug_unique')) {
            Schema::table('programs', function (Blueprint $table) {
                $table->dropUnique('programs_university_id_slug_unique');
            });
        }

        if (! Schema::hasIndex('programs', 'programs_slug_unique')) {
            Schema::table('programs', function (Blueprint $table) {
                $table->unique('slug');
            });
        }
    }
};
