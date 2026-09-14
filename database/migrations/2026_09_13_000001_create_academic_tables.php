<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('universities', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 20)->nullable()->index();
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->string('acronym', 20)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('colleges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('location')->nullable();
            $table->string('address')->nullable();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('website')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('university_id');
        });

        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('university_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->string('code', 30)->nullable()->index();
            $table->string('level', 50)->nullable();
            $table->integer('duration_years')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['university_id', 'slug']);
        });

        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->integer('number')->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('program_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 30)->nullable()->index();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->string('color')->default('#0B63CE');
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('semester_id');
            $table->index('program_id');
        });

        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('subject_id');
        });

        Schema::create('topics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('unit_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();

            $table->index('unit_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('topics');
        Schema::dropIfExists('units');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('semesters');
        Schema::dropIfExists('programs');
        Schema::dropIfExists('colleges');
        Schema::dropIfExists('universities');
    }
};