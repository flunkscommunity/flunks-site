import useSWR from 'swr';
import {
  Frame,
  Table,
  TableHead,
  TableHeadCell,
  TableRow,
  TableBody,
  TableDataCell,
} from 'react95';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ScoreRow {
  wallet: string;
  score: number;
  challenge_id?: string;
  metadata?: any;
  timestamp?: string;
}

const FlappyLeaderboardWindow: React.FC = () => {
  const {
    data: scores,
    error,
    isValidating,
  } = useSWR<ScoreRow[]>('/api/flappyflunk-leaderboard', fetcher);

  const isLoading = !scores && !error;

  const hasScores = scores && scores.length > 0;

  return (
    <Frame variant="well" className="p-2 h-full w-full overflow-auto">
      <Table className="w-full">
        <TableHead>
          <TableRow>
            <TableHeadCell>#</TableHeadCell>
            <TableHeadCell>Wallet</TableHeadCell>
            <TableHeadCell>Score</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {error && (
            <TableRow>
              <td colSpan={3} style={{ padding: 8, textAlign: 'center' }}>⚠️ Failed to load scores</td>
            </TableRow>
          )}

          {isLoading && (
            <TableRow>
              <td colSpan={3} style={{ padding: 8, textAlign: 'center' }}>Loading...</td>
            </TableRow>
          )}

          {hasScores &&
            scores!.map((row, idx) => (
              <TableRow key={idx}>
                <TableDataCell>{idx + 1}</TableDataCell>
                <TableDataCell className="truncate max-w-[120px]">
                  {row.wallet}
                </TableDataCell>
                <TableDataCell>{row.score}</TableDataCell>
              </TableRow>
            ))}

          {!isLoading && !error && scores?.length === 0 && (
            <TableRow>
              <td colSpan={3} style={{ padding: 8, textAlign: 'center' }}>No scores yet</td>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Frame>
  );
};

export default FlappyLeaderboardWindow;
