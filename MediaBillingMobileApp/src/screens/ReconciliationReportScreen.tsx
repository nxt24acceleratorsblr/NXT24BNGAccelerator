import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { ReconciliationResult } from '../types';

type ReconciliationReportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReconciliationReport'>;
  route: RouteProp<RootStackParamList, 'ReconciliationReport'>;
};

const ReconciliationReportScreen: React.FC<ReconciliationReportScreenProps> = ({ navigation, route }) => {
  const { reconciliationData } = route.params;
  const data = reconciliationData as ReconciliationResult;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return '#dc3545';
      case 'HIGH':
        return '#fd7e14';
      case 'MEDIUM':
        return '#ffc107';
      case 'LOW':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getTrustScoreColor = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return '#28a745';
      case 'GOOD':
        return '#5cb85c';
      case 'FAIR':
        return '#ffc107';
      case 'POOR':
        return '#fd7e14';
      case 'CRITICAL':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Reconciliation Report</Text>
        <Text style={styles.subtitle}>Analysis Complete</Text>
      </View>

      <View style={styles.content}>
        {/* Trust Score */}
        {data.trust_score && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trust Score</Text>
            <View style={[styles.scoreCard, { borderLeftColor: getTrustScoreColor(data.trust_score.level) }]}>
              <View style={styles.scoreHeader}>
                <Text style={styles.scoreValue}>{data.trust_score.score.toFixed(1)}</Text>
                <Text style={[styles.scoreLevel, { color: getTrustScoreColor(data.trust_score.level) }]}>
                  {data.trust_score.level}
                </Text>
              </View>
              <View style={styles.scoreDetails}>
                <Text style={styles.scoreText}>
                  Match Rate: {data.trust_score.match_rate.toFixed(1)}%
                </Text>
                <Text style={styles.scoreText}>
                  Matches: {data.trust_score.successful_matches}/{data.trust_score.total_items}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{data.mapping_files_count}</Text>
              <Text style={styles.statLabel}>Mapping Files</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#28a745' }]}>
                {data.summary.fuzzy_matches}
              </Text>
              <Text style={styles.statLabel}>Matched</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#ffc107' }]}>
                {data.summary.discrepancies}
              </Text>
              <Text style={styles.statLabel}>Discrepancies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: '#dc3545' }]}>
                {data.summary.unmatched}
              </Text>
              <Text style={styles.statLabel}>Unmatched</Text>
            </View>
          </View>
        </View>

        {/* Severity Breakdown */}
        {data.trust_score && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Severity Breakdown</Text>
            <View style={styles.severityList}>
              <View style={styles.severityRow}>
                <View style={[styles.severityDot, { backgroundColor: '#dc3545' }]} />
                <Text style={styles.severityLabel}>Critical:</Text>
                <Text style={styles.severityValue}>
                  {data.trust_score.severity_breakdown.CRITICAL}
                </Text>
              </View>
              <View style={styles.severityRow}>
                <View style={[styles.severityDot, { backgroundColor: '#fd7e14' }]} />
                <Text style={styles.severityLabel}>High:</Text>
                <Text style={styles.severityValue}>
                  {data.trust_score.severity_breakdown.HIGH}
                </Text>
              </View>
              <View style={styles.severityRow}>
                <View style={[styles.severityDot, { backgroundColor: '#ffc107' }]} />
                <Text style={styles.severityLabel}>Medium:</Text>
                <Text style={styles.severityValue}>
                  {data.trust_score.severity_breakdown.MEDIUM}
                </Text>
              </View>
              <View style={styles.severityRow}>
                <View style={[styles.severityDot, { backgroundColor: '#28a745' }]} />
                <Text style={styles.severityLabel}>Low:</Text>
                <Text style={styles.severityValue}>
                  {data.trust_score.severity_breakdown.LOW}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Discrepancies */}
        {data.discrepancy_report && data.discrepancy_report.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⚠️ Discrepancies ({data.discrepancy_report.length})
            </Text>
            {data.discrepancy_report.slice(0, 10).map((disc: any, idx: number) => (
              <View
                key={`${disc.Campaign}-${disc.Field}-${idx}`}
                style={[
                  styles.discrepancyCard,
                  { borderLeftColor: getSeverityColor(disc.Severity) },
                ]}
              >
                <View style={styles.discrepancyHeader}>
                  <Text style={styles.discrepancyCampaign}>{disc.Campaign}</Text>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: getSeverityColor(disc.Severity) },
                    ]}
                  >
                    <Text style={styles.severityBadgeText}>{disc.Severity}</Text>
                  </View>
                </View>
                <Text style={styles.discrepancyField}>Field: {disc.Field}</Text>
                <View style={styles.discrepancyValues}>
                  <View style={styles.valueColumn}>
                    <Text style={styles.valueLabel}>Extracted:</Text>
                    <Text style={styles.valueText}>{disc['Extracted Value']}</Text>
                  </View>
                  <View style={styles.valueColumn}>
                    <Text style={styles.valueLabel}>Planned:</Text>
                    <Text style={styles.valueText}>{disc['Planned Value']}</Text>
                  </View>
                </View>
                {disc['Difference %'] !== 'N/A' && (
                  <Text style={styles.difference}>
                    Difference: {disc['Difference %']}%
                  </Text>
                )}
              </View>
            ))}
            {data.discrepancy_report.length > 10 && (
              <Text style={styles.moreText}>
                + {data.discrepancy_report.length - 10} more discrepancies
              </Text>
            )}
          </View>
        )}

        {data.discrepancy_report && data.discrepancy_report.length === 0 && (
          <View style={styles.section}>
            <View style={styles.successCard}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Perfect Match!</Text>
              <Text style={styles.successText}>
                No discrepancies found. All invoice items match the planned data.
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('InvoiceExtractor')}
        >
          <Text style={styles.buttonText}>← Process Another Invoice</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  scoreCard: {
    borderLeftWidth: 4,
    paddingLeft: 12,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 12,
  },
  scoreLevel: {
    fontSize: 18,
    fontWeight: '600',
  },
  scoreDetails: {
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  severityList: {
    gap: 12,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  severityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  discrepancyCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  discrepancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  discrepancyCampaign: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  discrepancyField: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  discrepancyValues: {
    flexDirection: 'row',
    gap: 16,
  },
  valueColumn: {
    flex: 1,
  },
  valueLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  valueText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  difference: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 8,
    fontWeight: '600',
  },
  moreText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  successCard: {
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReconciliationReportScreen;
