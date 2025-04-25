import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

export async function GET() {
  try {
    const yamlContent = readFileSync(join(process.cwd(), 'docs', 'openapi.yaml'), 'utf8');
    const jsonContent = yaml.load(yamlContent);
    return NextResponse.json(jsonContent);
  } catch (error) {
    console.error('Error loading OpenAPI spec:', error);
    return NextResponse.json({ error: 'Failed to load API specification' }, { status: 500 });
  }
}
