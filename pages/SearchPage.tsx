import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { extractBillNumber } from '../services/dataService';
import type { SystemReport, BankTransaction } from '../types';

declare const Fuse: any;
declare const jspdf: any;
declare const XLSX: any;

const LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADJCAYAAAAyQjZ3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAACHGSURBVHhe7Z0HgB1VlefjE4QkCAmhgBBISCFlpAiiYkEFKqgLVgRBHxZ717tWXy8W/FhQ7F17r/WqiFgLgoAKKAoYdEEgBAghkBBCQhZCspv/O2fvn7n3b/bu7G72JsnO++XjM7vzz8yZM3PmzJyZSUhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh-ioh-s/sQ/sQ+M/J2dn/S3NnP9rC/93rW/sFv3bM7O7sTeJLk533y8Z3Z5+ZMmbunNmzJyZSUhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh-otokoulu...'.
#include React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../App';
import { extractBillNumber } from '../services/dataService';
import type { SystemReport, BankTransaction } from '../types';

declare const Fuse: any;
declare const jspdf: any;
declare const XLSX: any;

const LOGO_URL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADJCAYAAAAyQjZ3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAACHGSURBVHhe7Z0HgB1VlefjE4QkCAmhgBBISCFlpAiiYkEFKqgLVgRBHxZ717tWXy8W/FhQ7F17r/WqiFgLgoAKKAoYdEEgBAghkBBCQhZCspv/O2fvn7n3b/bu7G72JsnO++XjM7vzz8yZM3PmzJyZSUhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEh-fioh-SjZ35VwAAAABJRU5ErkJggg==';

const ICONS = {
  search: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  pdf: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  clear: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  paid: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
  pending: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.555 10a.5.5 0 01.5-.5h2.95l.38-1.516a.5.5 0 01.972.032l.16.641a.5.5 0 00.465.345h.21a.5.5 0 00.474-.684l-.18-1.936a.5.5 0 01.966-.145l.12.599a.5.5 0 00.473.34h.21a.5.5 0 00.474-.684l-.18-1.936a.5.5 0 01.966-.145l.12.599a.5.5 0 00.473.34h.21a.5.5 0 00.474-.684l-.18-1.936a.5.5 0 11.966.145l.324 3.421a.5.5 0 01-.474.532h-2.1a.5.5 0 00-.474.684l.18 1.936a.5.5 0 01-.966.145l-.12-.599a.5.5 0 00-.473-.34h-.21a.5.5 0 00-.474.684l.18 1.936a.5.5 0 01-.966.145l-.12-.599a.5.5 0 00-.473-.34h-.21a.5.5 0 00-.474.684l.18 1.936a.5.5 0 11-.966-.145l-.324-3.421a.5.5 0 01.474-.532H9.5a.5.5 0 000-1H5.555z" clipRule="evenodd" /></svg>,
  cancelled: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>,
  default: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>,
  chevronDown: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>,
  chevronUp: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>,
};

type SearchResult = {
    systemRecord: SystemReport;
    bankTransactions: BankTransaction[];
};

const normalizeString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str.toString().replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/\s+/g, ' ').trim().toLowerCase();
};

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
    const normalizedStatus = status.trim();
    let style = { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: ICONS.default };
    if (normalizedStatus.includes('پرداخت شده') || normalizedStatus.includes('تسويه کامل')) {
        style = { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', icon: ICONS.paid };
    } else if (normalizedStatus.includes('مانده دارد') || normalizedStatus.includes('در انتظار')) {
        style = { bg: 'bg-yellow-100 dark:bg-yellow-800/50', text: 'text-yellow-800 dark:text-yellow-300', icon: ICONS.pending };
    } else if (normalizedStatus.includes('لغو')) {
        style = { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', icon: ICONS.cancelled };
    }
    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text}`}>{style.icon}<span className="mr-1.5">{status}</span></span>;
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div><p className="font-semibold text-gray-500 dark:text-gray-400">{label}</p><div className="text-gray-800 dark:text-gray-200 mt-1">{value || '-'}</div></div>
);

const DetailTable: React.FC<{ data: object; title: string }> = ({ data, title }) => (
    <div className="mt-4 first:mt-0">
        <h4 className="font-semibold text-md mb-2 text-gray-700 dark:text-gray-300">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm bg-gray-100 dark:bg-gray-900/50 p-3 rounded-md">
            {Object.entries(data).map(([key, value]) => {
                const isNumeric = ['مبلغ', 'برداشت', 'واریز', 'موجودی', 'پیش حمل', 'پس حمل', 'کرایه حمل', 'پرداختی', 'مانده کرایه'].includes(key);
                return <div key={key}><span className="font-medium text-gray-500 dark:text-gray-400">{key}: </span><span className="text-gray-900 dark:text-gray-100">{value === null || value === undefined ? '-' : isNumeric ? Number(value).toLocaleString('fa-IR') : String(value)}</span></div>;
            })}
        </div>
    </div>
);

const FILTERS_STORAGE_KEY = 'searchPageAdvancedFilters';

const SearchPage: React.FC = () => {
    const { systemData, bankData } = useAppContext();
    const [searchParams] = useSearchParams();
    const searchFromUrl = useRef(false);

    const [query, setQuery] = useState('');
    const [baseResults, setBaseResults] = useState<SearchResult[]>([]);
    const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
    const [amountError, setAmountError] = useState('');
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    
    const initialFilters = {
        startDate: '', endDate: '', minAmount: '', maxAmount: '', status: 'همه', driver: '',
        contractor: '', recipientAccount: '', recipientName: '', reconciliationStatus: 'همه',
    };
    
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);

    // Effect to load filters from localStorage on mount
    useEffect(() => {
        try {
            const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
            if (savedFilters) {
                const parsedFilters = JSON.parse(savedFilters);
                const mergedFilters = { ...initialFilters, ...parsedFilters };
                setFilters(mergedFilters);
                setAppliedFilters(mergedFilters);
            }
        } catch (error) {
            console.error("Failed to load or parse filters from localStorage", error);
            localStorage.removeItem(FILTERS_STORAGE_KEY);
        }
    }, []);

    // Effect to save applied filters to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(appliedFilters));
        } catch (error) {
            console.error("Failed to save filters to localStorage", error);
        }
    }, [appliedFilters]);


    const systemStatuses = useMemo(() => ['همه', ...Array.from(new Set(systemData.map(item => item['وضعیت'])))], [systemData]);

    const performSearch = useCallback(() => {
        const resultsMap = new Map<string, SearchResult>();
        const bankDataByBillNo = new Map<string, BankTransaction[]>();
        bankData.forEach(tx => {
            const billNo = extractBillNumber(tx['شرح / بابت']);
            if (billNo) {
                if (!bankDataByBillNo.has(billNo)) bankDataByBillNo.set(billNo, []);
                bankDataByBillNo.get(billNo)!.push(tx);
            }
        });

        const systemDataByBillNo = new Map<string, SystemReport>();
        systemData.forEach(rec => systemDataByBillNo.set(String(rec['شماره بارنامه']).slice(-6), rec));

        const normalizedQuery = normalizeString(query);
        let searchPool = systemData;

        if (normalizedQuery.length > 0) {
            const fuse = new Fuse(systemData, {
                keys: ['راننده', 'شماره بارنامه', 'طرف قرارداد', 'شماره انتظامی'],
                threshold: 0.4,
                includeScore: true,
            });
            searchPool = fuse.search(normalizedQuery).map((result: any) => result.item);

            const bankMatches = bankData.filter(bankTx =>
                normalizeString(bankTx['نام صاحب حساب مقصد']).includes(normalizedQuery) ||
                normalizeString(bankTx['شرح / بابت']).includes(normalizedQuery)
            );
            bankMatches.forEach(bankTx => {
                const billNo = extractBillNumber(bankTx['شرح / بابت']);
                const systemRecord = billNo ? systemDataByBillNo.get(billNo) : undefined;
                if (systemRecord) searchPool.push(systemRecord);
            });
            searchPool = [...new Map(searchPool.map(item => [item['شماره بارنامه'], item])).values()];
        }

        searchPool.forEach(sysRecord => {
            const billNo = String(sysRecord['شماره بارنامه']).slice(-6);
            if (billNo) resultsMap.set(billNo, { systemRecord: sysRecord, bankTransactions: bankDataByBillNo.get(billNo) || [] });
        });
        setBaseResults(Array.from(resultsMap.values()));
        setSelectedResults(new Set());
    }, [query, bankData, systemData]);
    
    useEffect(() => {
        if (systemData.length > 0 || bankData.length > 0) performSearch();
    }, [systemData, bankData, performSearch]);
    
    const handleApplyFilters = useCallback(() => {
        if (!amountError) setAppliedFilters(filters);
    }, [filters, amountError]);
    
    const handleSearch = useCallback(() => {
        performSearch();
        handleApplyFilters();
    }, [performSearch, handleApplyFilters]);

    // Effect to handle search triggered from global header search
    useEffect(() => {
        const urlQuery = searchParams.get('q');
        if (urlQuery && urlQuery !== query) {
            searchFromUrl.current = true;
            setQuery(urlQuery);
        }
    }, [searchParams, query]);
    
    // Effect to run the search logic when the query is updated from the URL
    useEffect(() => {
        if (searchFromUrl.current) {
            handleSearch();
            searchFromUrl.current = false;
        }
    }, [query, handleSearch]);


    const displayedResults = useMemo(() => {
        const filtered = baseResults.filter(result => {
            const { startDate, endDate, minAmount, maxAmount, status, driver, contractor, recipientAccount, recipientName, reconciliationStatus } = appliedFilters;
            const sys = result.systemRecord; const bankTxs = result.bankTransactions;

            const reconciliationMatch = (() => {
                if (reconciliationStatus === 'همه') return true;
                
                const isMatched = bankTxs.length > 0;
                const totalBankAmount = bankTxs.reduce((sum, tx) => sum + (tx['مبلغ'] || 0), 0);
                const hasDiscrepancy = isMatched && Math.abs(sys['پرداختی'] - totalBankAmount) > 1;

                if (reconciliationStatus === 'تطبیق یافته') {
                    return isMatched && !hasDiscrepancy;
                }
                if (reconciliationStatus === 'تطبیق نیافته') {
                    return !isMatched;
                }
                if (reconciliationStatus === 'دارای مغایرت') {
                    return hasDiscrepancy;
                }
                return true;
            })();
            if (!reconciliationMatch) return false;

            if (status !== 'همه' && normalizeString(sys['وضعیت']) !== normalizeString(status)) return false;
            if (driver && !normalizeString(sys['راننده']).includes(normalizeString(driver))) return false;
            if (contractor && !normalizeString(sys['طرف قرارداد']).includes(normalizeString(contractor))) return false;
            
            const sysDate = new Date(String(sys['تاریخ']).replace(/\//g, '-'));
            if (startDate && sysDate < new Date(startDate)) return false;
            if (endDate && sysDate > new Date(endDate)) return false;
            
            const sysAmount = sys['پرداختی'];
            if (minAmount && sysAmount < parseFloat(minAmount)) return false;
            if (maxAmount && sysAmount > parseFloat(maxAmount)) return false;

            if (recipientName && !bankTxs.some(tx => normalizeString(tx['نام صاحب حساب مقصد'])?.includes(normalizeString(recipientName)))) return false;
            if (recipientAccount && !bankTxs.some(tx => normalizeString(tx['حساب/شبا مقصد'])?.includes(normalizeString(recipientAccount)))) return false;
            
            return true;
        });

        // Default sort by date descending
        filtered.sort((a, b) => {
            const dateA = new Date(String(a.systemRecord['تاریخ']).replace(/\//g, '-')).getTime();
            const dateB = new Date(String(b.systemRecord['تاریخ']).replace(/\//g, '-')).getTime();
            if (isNaN(dateA)) return 1;
            if (isNaN(dateB)) return -1;
            return dateB - dateA;
        });

        return filtered;

    }, [baseResults, appliedFilters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };

        if (name === 'startDate' && value) {
            const startDate = new Date(value);
            const currentEndDate = filters.endDate ? new Date(filters.endDate) : null;
            if (!currentEndDate || currentEndDate < startDate) {
                const thirtyDaysLater = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                newFilters.endDate = thirtyDaysLater.toISOString().split('T')[0];
            }
        }
        setFilters(newFilters);

        if (name === 'minAmount' || name === 'maxAmount') {
            const min = parseFloat(newFilters.minAmount); const max = parseFloat(newFilters.maxAmount);
            setAmountError(!isNaN(min) && !isNaN(max) && min > max ? 'حداقل مبلغ نمی‌تواند بیشتر از حداکثر باشد.' : '');
        }
    };
    
    const clearFilter = (filterName: keyof typeof initialFilters) => {
        setFilters(prev => ({...prev, [filterName]: initialFilters[filterName]}));
    };
    
    const setDateRange = (period: 'thisMonth' | 'lastMonth' | 'thisYear') => {
        const now = new Date();
        let start, end;
        const formatDate = (date: Date) => date.toISOString().split('T')[0];

        if (period === 'thisMonth') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (period === 'lastMonth') {
            start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            end = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (period === 'thisYear') {
            start = new Date(now.getFullYear(), 0, 1);
            end = new Date(now.getFullYear(), 11, 31);
        }
        
        if (start && end) {
            setFilters(prev => ({ ...prev, startDate: formatDate(start), endDate: formatDate(end) }));
        }
    };

    const handleResetFilters = () => { setFilters(initialFilters); setAppliedFilters(initialFilters); setAmountError(''); };
    const handleSearchSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSearch(); };

    const handlePrintReport = () => {
        const selectedData = displayedResults.filter(r => selectedResults.has(r.systemRecord['شماره بارنامه']));
        if (selectedData.length === 0) { alert('لطفا حداقل یک مورد را برای چاپ انتخاب کنید.'); return; }
        
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Regular.ttf', 'Vazir', 'normal');
        doc.setFont('Vazir');

        selectedData.forEach((result, index) => {
            if (index > 0) doc.addPage();
            doc.addImage(LOGO_URL, 'PNG', 15, 12, 25, 12.8);
            doc.setFontSize(16);
            doc.text(`گزارش پرداخت بارنامه: ${result.systemRecord['شماره بارنامه']}`, doc.internal.pageSize.getWidth() - 15, 20, { align: 'right' });
            
            const systemHeaders = ['تاریخ', 'شماره بارنامه', 'راننده', 'وضعیت', 'مبدا', 'مقصد', 'طرف قرارداد', 'پرداختی'];
            doc.setFontSize(12);
            doc.text('اطلاعات سیستم', doc.internal.pageSize.getWidth() - 15, 35, { align: 'right' });
            doc.autoTable({
                startY: 40, theme: 'striped', styles: { font: 'Vazir', halign: 'right' },
                head: [systemHeaders.map(h => h).reverse()],
                body: [systemHeaders.map(h => result.systemRecord[h as keyof SystemReport] || '-').reverse()],
            });
            
            if (result.bankTransactions.length > 0) {
                const bankHeaders = ['تاریخ', 'مبلغ', 'شرح / بابت', 'نام صاحب حساب مقصد', 'شماره پیگیری'];
                doc.text('تراکنش های بانکی مرتبط', doc.internal.pageSize.getWidth() - 15, doc.autoTable.previous.finalY + 15, { align: 'right' });
                doc.autoTable({
                    startY: doc.autoTable.previous.finalY + 20, theme: 'grid', styles: { font: 'Vazir', halign: 'right' },
                    head: [bankHeaders.map(h => h).reverse()],
                    body: result.bankTransactions.map(bt => bankHeaders.map(h => bt[h as keyof BankTransaction] || '-').reverse()),
                });
            }
        });
        doc.save('گزارش_موارد_انتخابی.pdf');
    };

    const handlePrintSingleReport = (result: SearchResult) => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        doc.addFont('https://cdnjs.cloudflare.com/ajax/libs/vazir-font/30.1.0/Vazir-Regular.ttf', 'Vazir', 'normal');
        doc.setFont('Vazir');

        doc.addImage(LOGO_URL, 'PNG', 15, 12, 25, 12.8);
        doc.setFontSize(16);
        doc.text(`گزارش پرداخت بارنامه: ${result.systemRecord['شماره بارنامه']}`, doc.internal.pageSize.getWidth() - 15, 20, { align: 'right' });

        const systemHeaders = ['تاریخ', 'شماره بارنامه', 'راننده', 'وضعیت', 'مبدا', 'مقصد', 'طرف قرارداد', 'پرداختی'];
        doc.setFontSize(12);
        doc.text('اطلاعات سیستم', doc.internal.pageSize.getWidth() - 15, 35, { align: 'right' });
        doc.autoTable({
            startY: 40, theme: 'striped', styles: { font: 'Vazir', halign: 'right' },
            head: [systemHeaders.map(h => h).reverse()],
            body: [systemHeaders.map(h => result.systemRecord[h as keyof SystemReport] || '-').reverse()],
        });
        
        if (result.bankTransactions.length > 0) {
            const bankHeaders = ['تاریخ', 'مبلغ', 'شرح / بابت', 'نام صاحب حساب مقصد', 'شماره پیگیری'];
            doc.text('تراکنش های بانکی مرتبط', doc.internal.pageSize.getWidth() - 15, doc.autoTable.previous.finalY + 15, { align: 'right' });
            doc.autoTable({
                startY: doc.autoTable.previous.finalY + 20, theme: 'grid', styles: { font: 'Vazir', halign: 'right' },
                head: [bankHeaders.map(h => h).reverse()],
                body: result.bankTransactions.map(bt => bankHeaders.map(h => bt[h as keyof BankTransaction] || '-').reverse()),
            });
        }
        
        doc.save(`گزارش_بارنامه_${result.systemRecord['شماره بارنامه']}.pdf`);
    };

    const handleToggleSelection = (billNo: string) => setSelectedResults(prev => { const newSet = new Set(prev); if (newSet.has(billNo)) newSet.delete(billNo); else newSet.add(billNo); return newSet; });
    const handleToggleSelectAll = () => { if (selectedResults.size === displayedResults.length) setSelectedResults(new Set()); else setSelectedResults(new Set(displayedResults.map(r => r.systemRecord['شماره بارنامه']))); };
    const toggleExpand = (billNo: string) => setExpandedResults(prev => { const newSet = new Set(prev); if (newSet.has(billNo)) newSet.delete(billNo); else newSet.add(billNo); return newSet; });
    
    const renderFilterInput = (name: keyof typeof initialFilters, placeholder: string, type: string = 'text', options: string[] = []) => (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{placeholder}</label>
            {type === 'select' ? (
                <select name={name} value={filters[name]} onChange={handleFilterChange} className="input-filter">{options.map(s => <option key={s} value={s}>{s}</option>)}</select>
            ) : (
                <input type={type} name={name} placeholder={placeholder} value={filters[name]} onChange={handleFilterChange} className="input-filter" />
            )}
            {filters[name] && filters[name] !== 'همه' && (
                <button type="button" onClick={() => clearFilter(name)} className="absolute left-2 top-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full" aria-label={`پاک کردن ${placeholder}`}>{ICONS.clear}</button>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-8"><h1 className="text-2xl font-bold">جستجوی هوشمند</h1><p className="text-gray-500">جستجو بر اساس نام، شماره بارنامه و فیلترهای پیشرفته.</p></div>
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md mb-8">
                <form onSubmit={handleSearchSubmit}>
                    <div className="flex gap-4">
                        <div className="relative flex-grow">
                            <input type="text" placeholder="عبارت مورد نظر خود را وارد کنید یا برای دیدن همه، خالی بگذارید..." value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-20 pr-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500" />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">{query && <button type="button" onClick={() => setQuery('')} aria-label="پاک کردن جستجو">{ICONS.clear}</button>}{ICONS.search}</div>
                        </div>
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">جستجو</button>
                    </div>
                    
                    <div className="pt-2">
                        <details className="accordion-item" open>
                            <summary className="accordion-title">فیلترهای عمومی</summary>
                            <div className="accordion-content">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">بازه تاریخ</label>
                                        <div className="flex items-center gap-2">
                                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input-filter" title="تاریخ شروع" />
                                            <span>تا</span>
                                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input-filter" title="تاریخ پایان" />
                                            {(filters.startDate || filters.endDate) && <button type="button" onClick={() => setFilters(p => ({...p, startDate: '', endDate: ''}))} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">{ICONS.clear}</button>}
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button type="button" onClick={() => setDateRange('thisMonth')} className="date-shortcut">این ماه</button>
                                            <button type="button" onClick={() => setDateRange('lastMonth')} className="date-shortcut">ماه قبل</button>
                                            <button type="button" onClick={() => setDateRange('thisYear')} className="date-shortcut">امسال</button>
                                        </div>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">بازه مبلغ (پرداختی)</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" name="minAmount" placeholder="حداقل" value={filters.minAmount} onChange={handleFilterChange} className="input-filter" />
                                            <span>تا</span>
                                            <input type="number" name="maxAmount" placeholder="حداکثر" value={filters.maxAmount} onChange={handleFilterChange} className="input-filter" />
                                            {(filters.minAmount || filters.maxAmount) && <button type="button" onClick={() => setFilters(p => ({...p, minAmount: '', maxAmount: ''}))} className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">{ICONS.clear}</button>}
                                        </div>
                                        {amountError && <p className="text-red-500 text-xs mt-1">{amountError}</p>}
                                    </div>
                                </div>
                                 <div className="mt-4">{renderFilterInput('reconciliationStatus', 'وضعیت تطبیق', 'select', ['همه', 'تطبیق یافته', 'دارای مغایرت', 'تطبیق نیافته'])}</div>
                            </div>
                        </details>
                        <details className="accordion-item">
                            <summary className="accordion-title">فیلترهای سیستم</summary>
                            <div className="accordion-content grid grid-cols-1 md:grid-cols-3 gap-4">
                                {renderFilterInput('status', 'وضعیت', 'select', systemStatuses)}
                                {renderFilterInput('driver', 'نام راننده')}
                                {renderFilterInput('contractor', 'طرف قرارداد')}
                            </div>
                        </details>
                         <details className="accordion-item">
                            <summary className="accordion-title">فیلترهای بانک</summary>
                            <div className="accordion-content grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFilterInput('recipientName', 'نام گیرنده')}
                                {renderFilterInput('recipientAccount', 'حساب/شبا گیرنده')}
                            </div>
                        </details>
                        <div className="flex justify-end gap-4 mt-4 pt-4 border-t dark:border-gray-700">
                            <button type="button" onClick={handleResetFilters} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">پاک کردن همه</button>
                            <button type="button" onClick={handleApplyFilters} className="px-6 py-2 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600">اعمال فیلترها</button>
                        </div>
                    </div>
                </form>
            </div>
            
            {baseResults.length > 0 && (
                <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <input type="checkbox" className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500" onChange={handleToggleSelectAll} checked={selectedResults.size === displayedResults.length && displayedResults.length > 0} id="select-all" />
                        <label htmlFor="select-all" className="font-semibold">{selectedResults.size === displayedResults.length ? "لغو انتخاب همه" : "انتخاب همه"}</label>
                        <span className="text-sm text-gray-600 dark:text-gray-400">({selectedResults.size.toLocaleString('fa-IR')} از {displayedResults.length.toLocaleString('fa-IR')} مورد انتخاب شده)</span>
                    </div>
                    <button onClick={handlePrintReport} disabled={selectedResults.size === 0} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700">{ICONS.pdf} چاپ گزارش موارد انتخابی</button>
                </div>
            )}

            <div className="space-y-4">
                {displayedResults.length > 0 ? displayedResults.map((result, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-md transition-all duration-300 relative">
                        <div className="absolute top-4 left-4 flex gap-2">
                             <button onClick={() => handlePrintSingleReport(result)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="صدور PDF">{React.cloneElement(ICONS.pdf, {className:"h-6 w-6"})}</button>
                             <button onClick={() => toggleExpand(result.systemRecord['شماره بارنامه'])} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="نمایش جزئیات">{expandedResults.has(result.systemRecord['شماره بارنامه']) ? ICONS.chevronUp : IONS.chevronDown}</button>
                        </div>
                        <div className="flex gap-4">
                            <input type="checkbox" className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 mt-2 flex-shrink-0" checked={selectedResults.has(result.systemRecord['شماره بارنامه'])} onChange={() => handleToggleSelection(result.systemRecord['شماره بارنامه'])} />
                            <div className="flex-grow">
                                <div className="border-b dark:border-gray-700 pb-4 mb-4 flex justify-between items-start">
                                    <div><h2 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">بارنامه: {result.systemRecord['شماره بارنامه']}</h2><p className="text-sm text-gray-500">راننده: {result.systemRecord['راننده']}</p></div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${result.bankTransactions.length > 0 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-800 dark:text-yellow-300'}`}>{result.bankTransactions.length > 0 ? 'تطبیق یافته' : 'تطبیق نیافته'}</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <DetailItem label="تاریخ" value={result.systemRecord['تاریخ']} />
                                    <DetailItem label="طرف قرارداد" value={result.systemRecord['طرف قرارداد']} />
                                    <DetailItem label="وضعیت" value={<StatusChip status={result.systemRecord['وضعیت']} />} />
                                    <DetailItem label="پرداختی" value={result.systemRecord['پرداختی']?.toLocaleString('fa-IR') + " ریال"} />
                                </div>
                                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedResults.has(result.systemRecord['شماره بارنامه']) ? 'max-h-[1000px] mt-4 pt-4 border-t dark:border-gray-700' : 'max-h-0'}`}>
                                    <DetailTable data={result.systemRecord} title="جزئیات کامل رکورد سیستم" />
                                    {result.bankTransactions.map((tx, i) => <DetailTable key={i} data={tx} title={`جزئیات کامل تراکنش بانکی #${i + 1}`} />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (<div className="text-center py-16 text-gray-500"><p>نتیجه‌ای یافت نشد. لطفا عبارت جستجو یا فیلترهای خود را تغییر دهید.</p></div>)}
            </div>
            <style>{`
                .input-filter { padding: 0.75rem 1rem; border-radius: 0.5rem; background-color: #f3f4f6; border: 1px solid #d1d5db; width: 100%; transition: all 0.2s; } 
                .dark .input-filter { background-color: #374151; border-color: #4b5563; }
                .input-filter:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5); }
                .accordion-item { border-top: 1px solid #e5e7eb; } 
                .dark .accordion-item { border-top-color: #374151; }
                .accordion-item:first-of-type { border-top: none; }
                .accordion-title { cursor: pointer; padding: 1rem 0.5rem; font-weight: 600; display: flex; justify-content: space-between; align-items: center; transition: background-color 0.2s; border-radius: 0.5rem; }
                .accordion-title:hover { background-color: #f9fafb; } 
                .dark .accordion-title:hover { background-color: rgba(255, 255, 255, 0.05); }
                .accordion-title::after { content: '▾'; transition: transform 0.3s ease; font-size: 1.25rem; color: #9ca3af; } 
                .dark .accordion-title::after { color: #6b7280; }
                .accordion-item[open] > .accordion-title { color: #4f46e5; }
                .dark .accordion-item[open] > .accordion-title { color: #818cf8; }
                .accordion-item[open] > .accordion-title::after { transform: rotate(180deg); }
                .accordion-content { padding: 0 0.5rem 1rem 0.5rem; }
                .date-shortcut { background-color: #eef2ff; color: #4338ca; font-size: 0.75rem; padding: 0.25rem 0.75rem; border-radius: 999px; transition: background-color 0.2s; }
                .date-shortcut:hover { background-color: #e0e7ff; }
                .dark .date-shortcut { background-color: #3730a3; color: #c7d2fe; } .dark .date-shortcut:hover { background-color: #4338ca; }
            `}</style>
        </div>
    );
};

export default SearchPage;